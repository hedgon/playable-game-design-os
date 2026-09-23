/* =====================================================================
   GAME SERVER
   The server that runs the game rather than merely stores them: authority,
   determinism, state sync, realtime protocols, matchmaking, scaling,
   anti-cheat and live operations. Same 8-part topic structure as every
   other domain, plus eng (how the client consumes this) and iv.

   Topics, each followed by its ENGINE and INTERVIEW:
     server-authority          Authority models: server-authoritative, host mode, client-simulate-server-verify
     server-determinism        Deterministic simulation and parity testing
     server-state-sync         State sync: delta sync, interpolation vs prediction, tick rates
     server-realtime-protocol  Realtime protocols: WebSocket framing, op codes, channels
     server-matchmaking        Matchmaking, rooms, sessions, reconnection policy
     server-scaling            Scaling: sharding, pub/sub fan-out, stateless vs stateful
     server-anticheat          Anti-cheat and abuse handling
     server-liveops            Live operations: maintenance gates, force update, batches, master data
   ===================================================================== */
DOMAINS.push({ id:'server', t:'Game Server', short:'Authority, determinism, sync, realtime, matchmaking, scaling, live ops', color:'var(--d-server)',
  sum:`The authoritative copy of the game. Where the backend answers questions, the game server decides what is true: who hit whom, what the world looks like this tick, and whether a client is allowed to say what it just said. Every choice here is a trade between responsiveness, fairness and cost.`,
  links:[['backend','The server shares the same layering, storage and observability as the service. It adds a clock.'],['core','Latency, prediction and rollback are the core loop as the player physically meets it over a network.'],['systems','Anything the economy or progression owns must be resolved by the authority, or it is a suggestion.'],['gameai','Server-side behaviour, directors and bots run inside the authoritative simulation, not beside it.'],['infra','Rooms, shards and fan-out are deployment shapes before they are code.']],
  titles:{ test:'What should I test or measure?' } });

T('server-authority',{ d:'server', t:'Authority models', tag:'Someone has to be right. Decide who, then design the wait the player feels while the truth arrives.',
  what:`Who owns the true state of the match. The four working answers are a server tick loop that simulates everything, host mode where one player's machine is the server, client-simulate-server-verify where the client resolves play and the server re-runs it to confirm, and lockstep where every peer runs the same simulation on shared inputs. The model decides what a client is allowed to assert, what it may only request, and what happens when the two disagree.`,
  why:[`Every anti-cheat, sync and fairness decision downstream is already fixed by this choice. Picking it late means rewriting the netcode.`,`It sets the latency the player feels. A server tick loop adds a round trip to every action unless you predict. Host mode gives the host zero latency and everyone else a permanent handicap.`,`It sets the cost. A tick loop per match is a running process per match. Verification after the fact is a request like any other.`,`It decides what is recoverable. If the client is the only place the match ever existed, a crash loses it.`],
  think:{ q:[`What is the smallest fact a cheater could fake that would ruin the game for someone else?`,`Does this game need to resolve interactions between players in real time, or only compare results afterwards?`,`How many concurrent matches will exist, and can I afford a process per match?`,`If the host leaves, what happens to the other nine players, and have I decided that on purpose?`,`Which actions can the client show immediately and correct later, and which must never be shown until confirmed?`],
    trade:[`Full server authority is fair and costs a round trip plus a running simulation per match. Host mode is cheap and responsive for one player and unfair to the rest.`,`Client-simulate-server-verify gives instant local play and detects cheating after the fact, but it cannot stop a player from experiencing a fake outcome for the seconds before the server disagrees.`],
    traps:[`Choosing host mode for the prototype and discovering at beta that the ranked mode needs authority the architecture cannot provide.`,`Trusting a value because the client computed it from values the server sent. The client can still lie about the result.`,`Letting the host's local simulation run one frame ahead of the message it sends, so the host sees hits nobody else can see.`,`Assuming an authoritative server implies lag compensation. Lag compensation is a separate decision with its own fairness cost.`,`Making the server authoritative for cosmetics and chat, where it buys nothing and costs bandwidth.`],
    good:[`You can state, for one named action, exactly which machine decides it and what the other machines do while they wait.`,`A design change to an action starts with the question of who resolves it.`],
    bad:[`The answer to "can the client cheat this" is "the client would not do that".`,`Two systems in the same game disagree about who is authoritative and nobody noticed until a desync bug.`] },
  how:[`Write the authority table before any netcode. One row per player-visible action, three columns: who decides, what the client may show before the decision, what the correction looks like when they differ.`,`Pick the model from that table, not from a framework tutorial. If no row needs real-time cross-player resolution, you do not need a tick loop.`,`Make the client's messages requests, never assertions. A client sends an intent and an input, the authority sends the outcome.`,`Give every correction a visible, designed form. A rubber band, a rewind, a refusal message. An unexplained snap reads as a bug.`,`In host mode, write down what the non-host players lose and compensate it in design rather than pretending it is symmetric.`,`Decide the host-leaves policy explicitly: migration, forfeit, or session death. Implement the one you chose and test it.`,`Keep the authority check at one chokepoint per action so an added feature cannot skip it.`],
  ai:{ yes:[`Draft the authority table from a list of player actions and mark which ones are exploitable if the client decides them.`,`Enumerate the failure cases of a stated model, such as host disconnect, duplicate submission, or a client that simulates faster than real time.`,`Turn a described model into a sequence diagram of one action across client, host and server so gaps become visible.`,`Compare two authority models against a stated concurrency and budget, listing what each costs per match.`],
       no:[`Choose the model. It is a product and cost commitment, not a technical preference.`,`Assert that a given check is sufficient against cheating. It will name plausible checks without knowing your client.`,`Write the correction feel. What a rewind should look like is a design question about the player's trust.`] },
  prompts:[{l:'Authority table',p:`Here is the list of actions a player can take in our match: [LIST]. Our proposed model is [MODEL]. For each action, fill three columns: which machine decides the outcome, what the acting client may legitimately display before that decision arrives, and what the visible correction is when the two differ. Mark every action where the client deciding would let someone gain an unfair advantage, and say what the cheat would look like.`},
    {l:'Model comparison',p:`We expect [N] concurrent matches of [PLAYERS] players, sessions of [LENGTH], on [PLATFORMS]. Compare server tick authority, host mode, and client-simulate-server-verify for this shape. For each: the latency the player feels on a named action, what a cheating client can achieve, the per-match running cost, and the failure mode when a player's connection drops. Do not recommend one until the end, and state the assumption that would flip your answer.`}],
  verify:[`Does every row of the authority table name a machine, or do some say "both"?`,`For each action the client displays early, is there a written correction behaviour, and has someone seen it fire?`,`Did the model get chosen against our concurrency and budget, or copied from a sample project?`],
  test:[`Play a match with 200 ms of artificial latency added to one client and have that player describe what felt wrong. Corrections you cannot explain to them are corrections you have not designed.`,`Run a client that submits a deliberately impossible outcome. Measure whether the authority rejects it, how long the faker saw the fake result, and whether anyone else ever saw it.`,`Kill the host mid-match. Measure what the other players see, how long they see it, and whether the session ends cleanly or leaves a zombie room.`],
  rel:[['core-loop','Authority decides how long the loop waits before a consequence is true, which is the loop the player actually feels.'],['game-feel-and-juice','Prediction and correction are felt as feel. A snap-back is a game feel problem before it is a netcode problem.'],['server-determinism','Client-simulate-server-verify is only possible if both sides compute the same answer from the same inputs.'],['server-state-sync','Once you know who decides, sync is the question of how that decision reaches everyone else.'],['server-anticheat','The authority model sets the ceiling on what cheating is even possible, before any detection is written.']],
  tech:[
    {n:'Server tick authority', how:`A server process runs the simulation at a fixed tick. Clients send inputs, the server advances state and broadcasts snapshots. Clients predict locally and reconcile against the authoritative snapshot.`, fit:`Competitive real-time games where players physically interact and fairness is the product.`, cost:`A running process per match, a prediction and reconciliation layer on the client, and a permanent latency budget to design around.`, alt:`If players never interact within the same instant, you do not need a tick loop at all.`},
    {n:'Host mode (one player is the server)', how:`One client starts as host and runs the authoritative simulation. Joiners connect to it. Sessions are found through a lobby or relay service so nobody needs a public address.`, fit:`Co-op and casual party games, small player counts, no ranking, no economy at stake.`, cost:`The host has zero latency and everyone else does not. The host can cheat freely. When the host leaves the match ends unless you build migration, which is its own project.`, alt:`A thin dedicated server for ranked modes while keeping host mode for casual play.`},
    {n:'Client simulates, server verifies', how:`The client runs the whole play locally and submits the seed plus the input trace. The server re-runs the identical simulation and accepts the result only if its own trace matches.`, fit:`Asynchronous or solo-run content, time trials, runs scored against a leaderboard. Anything where the result matters but the moment does not.`, cost:`Demands bit-exact parity between two runtimes and a golden-trace test that gates every change to either side. Detection is after the fact, never prevention.`, alt:`A plausibility check on the result alone is cheaper and catches only crude cheating.`},
    {n:'Deterministic lockstep', how:`Every peer runs the same simulation. Only inputs are exchanged, applied on an agreed tick with a small delay buffer.`, fit:`High unit counts where broadcasting state would be prohibitive, such as strategy games.`, cost:`One divergence desyncs everyone and is brutal to debug. Every peer waits for the slowest. Joining late means replaying the whole match.`, alt:`Snapshot sync with interest management, when unit counts are actually moderate.`}
  ] });
ENGINE('server-authority',{
  godot:{ term:`Authority is a per-node property of the scene tree. MultiplayerAPI decides whether this peer may drive a node, and RPCs are annotated with who is allowed to call them. The server peer is id 1.`,
    api:['MultiplayerAPI.is_server() / get_unique_id()','Node.set_multiplayer_authority(id, recursive)','@rpc("any_peer" | "authority", "call_local" | "call_remote", "reliable" | "unreliable")','MultiplayerAPI.get_remote_sender_id()','ENetMultiplayerPeer.create_server() / create_client()','SceneMultiplayer.auth_callback'],
    snippet:`extends Node

@rpc("any_peer", "call_remote", "reliable")
func request_fire(aim: Vector2) -> void:
\tif not multiplayer.is_server(): return          # clients ask, they do not decide
\tvar who := multiplayer.get_remote_sender_id()
\tif not _cooldown_ready(who): return             # never trust the caller's timing
\tconfirm_fire.rpc(who, _resolve(who, aim))

@rpc("authority", "call_local", "reliable")
func confirm_fire(peer: int, hit: bool) -> void:
\t_play_shot(peer, hit)                           # the truth, played everywhere`,
    pitfall:`Marking a gameplay RPC @rpc("any_peer") and then forgetting the is_server() guard inside it. "any_peer" only says who may call, never who may decide, so any client can invoke the function on every other client directly and the authority never sees it. Pair every "any_peer" entry point with an explicit authority check and a get_remote_sender_id() lookup, and send the outcome back as a separate "authority" RPC.`,
    map:`Godot @rpc("any_peer") is Unity [ServerRpc], @rpc("authority") is [ClientRpc], and set_multiplayer_authority() is NetworkObject ownership.` },
  unity:{ term:`Authority is ownership on a NetworkObject. A NetworkBehaviour knows whether it is running on the server and whether it owns the object, and calls cross the boundary as ServerRpc upward and ClientRpc downward.`,
    api:['NetworkBehaviour.IsServer / IsOwner / IsHost','[ServerRpc(RequireOwnership = true)]','[ClientRpc]','ServerRpcParams.Receive.SenderClientId','NetworkObject.ChangeOwnership()','NetworkManager.Singleton.StartHost() / StartServer()'],
    snippet:`public class Weapon : NetworkBehaviour {
    [SerializeField] InputActionReference fire;
    void Update() {
        if (IsOwner && fire.action.WasPressedThisFrame()) FireServerRpc(Aim());
    }

    [ServerRpc(RequireOwnership = true)]
    void FireServerRpc(Vector2 aim, ServerRpcParams p = default) {
        ulong who = p.Receive.SenderClientId;
        if (!CooldownReady(who)) return;          // the client asked, the server decides
        ConfirmClientRpc(who, Resolve(who, aim));
    }

    [ClientRpc] void ConfirmClientRpc(ulong who, bool hit) => PlayShot(who, hit);
}`,
    pitfall:`Running as host and testing only there. On a host the server and one client are the same process, so IsServer and IsOwner are both true for that player and every missing guard passes. The bugs appear the first time a real remote client connects. Always test with a dedicated server build or a second client, never only in host mode.`,
    map:`Unity [ServerRpc] is Godot @rpc("any_peer") plus an is_server() guard, [ClientRpc] is @rpc("authority"), and IsOwner is is_multiplayer_authority().` },
  note:`Both engines give you the plumbing for an authority model and neither gives you the model. The decision that matters is the authority table: which machine resolves each named action, what the acting client may draw before the answer arrives, and what the correction looks like. Write that table before you pick an attribute.` });
INTERVIEW('server-authority',{
  junior:[
    { q:`What does it mean for a server to be authoritative, and can you give an example of something a client should never be trusted to say for itself?`,
      a:`Authority means one machine's version of the truth wins. Give one concrete example: a client claiming it landed a hit, or claiming it has enough currency for a purchase. The server recomputes or checks that claim rather than accepting it. Say what the client is allowed to send instead: an intent, not a result.`,
      follow:`What would the client have to lie about to make that example matter in a competitive match?`,
      red:`Says the client "shouldn't cheat" instead of naming what the server actually checks.` },
    { q:`What's the practical difference between host mode and a dedicated server, from the player's chair?`,
      a:`In host mode one player's machine is also the server, so that player has zero network latency on their own actions and everyone else does not. A dedicated server treats every player identically but costs a round trip for everyone, including the host equivalent. Name a genre where host mode's asymmetry is acceptable and one where it is not.`,
      follow:`If the host disconnects, what happens to the other players, and is that answer written down anywhere?`,
      red:`Describes the two as interchangeable "networking options" with no mention of who benefits.` },
    { q:`For a single action, like firing a weapon, what can the client show immediately, and what has to wait?`,
      a:`The client can play the local animation and sound the instant the button is pressed, because that is feedback about the player's own input. Whether the shot actually hit is a fact about the world that the authority decides, and showing it early would be a guess dressed as a result. Give the concrete case where the guess and the real answer disagree.`,
      follow:`What should happen on screen in that disagreement, so it does not read as a bug?`,
      red:`Cannot separate "the input happened" from "the outcome is true", and shows both at the same moment.` }
  ],
  mid:[
    { q:`Walk me through how you'd choose between server tick authority, host mode, and client-simulate-server-verify for a new project.`,
      a:`Start from concurrency and cost: can you afford a running process per match. Then latency: does the game need real-time cross-player resolution or only a scored result after the fact. A tick loop suits real-time fairness at a real cost, host mode suits small casual co-op, client-simulate-server-verify suits solo runs scored on a leaderboard. Name the row in an authority table that decided it for you.`,
      follow:`Your concurrency estimate turns out to be ten times too low six months in. What actually has to change?`,
      red:`Picks a model from a tutorial or a competitor's marketing rather than from the game's own action list.` },
    { q:`A player reports that a hit registered and then got reversed. How do you explain what happened, and how would you design the correction so it reads as intentional?`,
      a:`The client predicted or displayed an outcome before the authority confirmed it, and the authority disagreed. Say that this is expected under client-simulate-server-verify or predicted movement, not a bug by itself. Design the visible correction, a rewind, a rubber band, an effect, rather than an unexplained snap, and say what you'd measure to confirm players understand it.`,
      follow:`How far can that correction move the player before it stops being a correction and starts being a new problem?`,
      red:`Treats every correction as a netcode bug to be minimised rather than a designed player-facing moment.` },
    { q:`In a co-op match the host disconnects. What's supposed to happen, and how was that decision made?`,
      a:`State the three real options: migrate the host, forfeit the match, or end the session. Say that this has to be decided and written down before launch, not discovered by a bug report, and that the answer depends on session length and stakes. Name what you'd implement for a short casual match versus a ranked one.`,
      follow:`What does the client show during the moment between the host leaving and the decided outcome taking effect?`,
      red:`Assumes host migration is "just a feature you add later" without pricing its engineering cost.` }
  ],
  senior:[
    { q:`You inherit a game where combat is server-authoritative but currency and inventory changes are trusted from the client. What's your assessment, and what do you do first?`,
      a:`Name the risk directly: anything the client asserts about its own economy state can be forged, and that is worse than a combat exploit because it is silent and permanent. Do not propose a rewrite. Propose the authority table across the whole game, mark every action by who currently decides it, and prioritise moving the highest-value, hardest-to-detect gaps first. Say how you'd sequence that without freezing feature work.`,
      follow:`The currency system is deeply wired into UI code that assumes it can set the balance directly. How do you sequence the fix without a full rewrite?`,
      red:`Declares the whole system needs a ground-up rewrite before doing the risk-ranked audit.` },
    { q:`How do you build the authority table for a new multiplayer feature, and what's the one thing you check before you sign off on it?`,
      a:`One row per player-visible action: who decides it, what the acting client may display before the decision, what the correction looks like when they differ. Build it before any netcode is written, from the actual action list, not from a framework's examples. The one check before sign-off: for every row, ask what a cheating client could gain if that row's answer were "the client decides", and confirm the table forecloses it.`,
      follow:`Someone on the team wants to make the table looser "just for the prototype." What's your answer?`,
      red:`Signs off on a table with rows marked "both" or left blank, treating it as documentation rather than a design contract.` }
  ] });

T('server-determinism',{ d:'server', t:'Deterministic simulation and parity', tag:'Two machines, one answer, bit for bit. Everything else is a guess wearing a checksum.',
  what:`Making a simulation produce exactly the same output from the same input on every machine that runs it, and proving it continuously. That means a seeded random source both sides implement identically, arithmetic that cannot drift, a fixed step that does not depend on frame rate, and a parity test that runs recorded inputs through both implementations and diffs the traces bit for bit.`,
  why:[`It is the precondition for client-simulate-server-verify, for lockstep, and for replays that still play back a year later.`,`Floating point drift is silent. A result that is wrong in the last bit today is a visibly different match outcome after ten thousand ticks.`,`Without a parity test in continuous integration, determinism decays with the next optimisation. Nobody breaks it on purpose.`,`It turns a cheating question into an arithmetic question, which is the only version of that question you can actually win.`],
  think:{ q:[`Which values must match exactly, and which are presentation that may differ freely?`,`Where does randomness enter, and is every source of it seeded and ordered?`,`Does the simulation read anything that varies per machine: frame time, wall clock, collection iteration order, thread scheduling, hardware capability?`,`Can I record an input trace and replay it to the same result on the same machine, before I even ask about two machines?`,`What is the smallest unit I can hash and compare, and how often do I compare it?`],
    trade:[`Integer or fixed-point maths is trivially deterministic and costs precision, range, and a rewrite of any formula you borrowed.`,`Floating point keeps the formulas readable and demands frozen implementations of every transcendental function plus compiler flags that forbid contraction, which is a permanent constraint on both toolchains.`],
    traps:[`Using the engine's global random source inside the simulation. It is shared with effects, animation and anything else that pulls from it, so the sequence depends on what else ran.`,`Iterating a hash map or dictionary and assuming order. It differs between runtimes and between runs.`,`Letting the compiler fuse a multiply and an add. The fused result is more accurate and therefore different, which is worse than being wrong the same way everywhere.`,`Feeding delta time into the simulation. The simulation gets a tick count, the renderer gets delta time.`,`Regenerating golden traces to make a failing test pass. That deletes the evidence that the change altered behaviour.`],
    good:[`One command replays a recorded match and prints a trace hash identical to the one stored with it.`,`A change that alters simulation output fails a test before it reaches review, and the author has to say why.`],
    bad:[`Desyncs are described as rare and are closed as not reproducible.`,`The team has a tolerance epsilon for comparing two simulations, which means they are not comparing simulations.`] },
  how:[`Draw a hard boundary. The simulation is a pure function of seed plus inputs plus tick count. Nothing inside it reads the clock, the frame rate, the screen or the network.`,`Give the simulation its own random generator, constructed from the seed, used in a fixed order, never shared with presentation.`,`Choose the arithmetic and write it down. Either fixed point throughout, or floats with a frozen implementation of every function that could vary, compiled with contraction disabled on both sides.`,`Record input traces from real play and store them as fixtures, together with the trace hash they produced.`,`Make the parity test a gate in continuous integration: run each fixture through both implementations, diff the traces bit for bit, fail on the first differing tick and print it.`,`Treat a golden-trace update as a separate, reviewed change that states what behaviour was deliberately altered.`,`Log the tick index and the state hash at intervals during real matches so a desync report names the tick where it started.`],
  ai:{ yes:[`Audit a simulation function for non-deterministic inputs: clock reads, unordered iteration, shared random sources, frame-dependent maths.`,`Port a formula to fixed point and list every place precision was lost.`,`Write the harness that replays a fixture and diffs two traces, including the report that prints the first differing tick and the values around it.`,`Explain why a specific pair of expressions can produce different results under contraction or different rounding.`],
       no:[`Certify that an implementation is deterministic. Only the parity test says that, and only for the inputs it ran.`,`Pick the epsilon. If you are choosing a tolerance, you have already left the deterministic design.`,`Regenerate golden traces on its own. That is exactly the change a human must justify.`] },
  prompts:[{l:'Determinism audit',p:`Here is the simulation code that must produce identical results on two runtimes: [CODE]. List every source of non-determinism you can see, grouped as: unseeded or shared randomness, clock or frame-rate dependence, unordered iteration, floating-point operations that may be contracted or rounded differently, and platform-dependent library calls. For each, give the smallest change that removes it and say what it costs.`},
    {l:'Parity harness',p:`We have a simulation implemented twice, in [LANGUAGE A] and [LANGUAGE B]. Inputs are a seed and a list of per-tick input records. Design a parity test that records fixtures from real play, replays them through both, and fails on the first differing tick. Specify the trace format, what is included and deliberately excluded, how fixtures are stored and versioned, and the rule for when regenerating a fixture is legitimate.`}],
  verify:[`Does the trace include every value the game's outcome depends on, and exclude presentation values that are allowed to differ?`,`Is the parity test comparing bit patterns, or comparing within a tolerance?`,`When a fixture was last regenerated, does the change that did it say which behaviour it intentionally altered?`],
  test:[`Replay every stored fixture through both implementations on every change to either side. Measure the first differing tick, not a pass count.`,`Run the same fixture on the oldest and newest supported device and on the server, and compare all three. Parity between two machines you own is not parity.`,`Instrument live matches with a periodic state hash. Measure how many sessions ever disagree, and keep the tick index when they do.`],
  rel:[['procedural-content','Seeded generation is the same problem: the same seed has to produce the same world on every machine, forever.'],['quality-and-build-health','A golden-trace gate is build health. It is the test that tells you a refactor changed the game.'],['server-authority','Client-simulate-server-verify only works if the two simulations agree bit for bit.'],['server-anticheat','Re-simulation is the detection mechanism, and it is worthless the moment parity is not proven.'],['backend-testing','Fixtures, golden traces and the rule against weakening an assertion are testing policy before they are netcode.']],
  tech:[
    {n:'Fixed-point arithmetic', how:`Represent every simulation quantity as a scaled integer. Multiplication and division carry the scale explicitly. Trigonometry and roots come from tables or integer algorithms.`, fit:`Lockstep games, cross-platform simulation where one of the runtimes you do not control, long matches where drift accumulates.`, cost:`Every formula is rewritten and reviewed for range and precision. Overflow becomes a real bug class. Designers lose the intuition of reading a value.`, alt:`Floats with frozen functions, when both runtimes are yours and you can control the compiler.`},
    {n:'Floats with frozen transcendentals', how:`Keep IEEE-754 doubles, but replace every library function whose implementation may vary with your own fixed implementation, and compile both sides with fused multiply-add contraction disabled.`, fit:`Two runtimes you own, formulas you want to keep readable, a port of an existing float simulation.`, cost:`A permanent constraint on both toolchains. A compiler upgrade or a new platform can reopen the question. The frozen functions need their own tests.`, alt:`Fixed point, if you are writing the simulation from scratch anyway.`},
    {n:'Input-trace replay', how:`Store only the seed and the per-tick inputs. Reproduce any match by replaying them through the current simulation.`, fit:`Bug reproduction, anti-cheat re-simulation, compact replay storage.`, cost:`A replay only plays back on a build whose simulation still matches. Old replays break with every deliberate balance change unless you version them.`, alt:`Recording the full state stream, which always plays back and costs orders of magnitude more storage.`},
    {n:'Periodic state hashing', how:`Hash the simulation state every N ticks and exchange the hash. On mismatch, stop and report the tick, the hash and the recent inputs.`, fit:`Lockstep and any peer simulation, as the detection net that catches drift you did not predict.`, cost:`Bandwidth and a hash cost every N ticks. Tells you that you desynced, never why.`, alt:`Full trace diffing offline, which finds the cause but cannot run live.`}
  ] });
ENGINE('server-determinism',{
  godot:{ term:`Determinism is not a Godot feature, it is a boundary you enforce. The simulation becomes a plain RefCounted class outside the scene tree, seeded by RandomNumberGenerator, stepped by a tick count rather than by delta.`,
    api:['RandomNumberGenerator.seed / randi_range()','RefCounted (simulation outside the SceneTree)','Engine.physics_ticks_per_second','PackedInt64Array / PackedByteArray','hash() / String.sha256_buffer()','Node._physics_process(delta) for presentation only'],
    snippet:`class_name Sim extends RefCounted

var _rng := RandomNumberGenerator.new()

func run(seed: int, inputs: PackedInt32Array) -> PackedInt64Array:
\t_rng.seed = seed                         # seed, never randomize()
\tvar trace := PackedInt64Array()
\tvar x := 0
\tfor i in inputs.size():
\t\tx += inputs[i] * 16 + _rng.randi_range(0, 15)   # integers only
\t\ttrace.append(x)
\treturn trace                             # hash this and send it with the result`,
    pitfall:`Reaching for the global randi() or calling randomize() anywhere in the project. The global generator is shared with particles, spawn jitter and anything else that pulls from it, so the sequence your simulation sees depends on what else happened to run that frame. The same applies to iterating a Dictionary and assuming order. Own your generator, own your iteration order.`,
    map:`Godot RandomNumberGenerator with an explicit seed is Unity's System.Random instance, and the global randi() is Unity's static UnityEngine.Random.` },
  unity:{ term:`Determinism means the simulation is a plain C# class with no UnityEngine dependency: no Time, no Random, no physics. It takes a seed and an input array and returns a trace, so an EditMode test and the server can both run it.`,
    api:['System.Random (instance, never UnityEngine.Random)','Time.fixedDeltaTime (presentation only)','Physics.autoSimulation = false / Physics.Simulate()','System.Runtime.CompilerServices.MethodImpl','decimal or long fixed-point maths','UnityEngine.TestTools EditMode tests'],
    snippet:`public static class Sim {
    const int TickMs = 16;                       // integer step, not deltaTime

    public static long[] Run(int seed, int[] inputs) {
        var rng = new System.Random(seed);       // instance: no shared global state
        var trace = new long[inputs.Length];
        long x = 0;
        for (int i = 0; i < inputs.Length; i++) {
            x += inputs[i] * TickMs + rng.Next(0, 16);
            trace[i] = x;
        }
        return trace;                            // the server re-runs this exact function
    }
}`,
    pitfall:`Assuming PhysX gives the same result on two machines. Unity's physics is not deterministic across platforms, builds or even solver iteration counts, so a simulation built on Rigidbody results cannot be verified server side. If the outcome must match, the outcome cannot come from the physics engine. Use physics for feel and a separate integer simulation for anything the server checks.`,
    map:`Unity's rule of keeping the simulation free of UnityEngine types is Godot's rule of keeping it in a RefCounted outside the SceneTree.` },
  note:`The engine side of parity is mostly subtraction. Everything convenient the engine offers inside a frame, from its global random source to its physics solver, is a machine-specific result. What survives the trip to a server is the code that would run identically in a console application.` });
INTERVIEW('server-determinism',{
  junior:[
    { q:`What does it mean for a simulation to be deterministic, and why does a game server care?`,
      a:`Same seed, same inputs, same output, every time, on every machine. Give the concrete reason a server cares: it is the precondition for re-running a client's claimed result and trusting the comparison, and for replays that still play back later. Contrast it with "looks the same," which is not the bar.`,
      follow:`What's the smallest test you could write to prove a piece of code actually meets that bar?`,
      red:`Describes determinism as "the game runs the same on my machine every time" without mentioning a second machine.` },
    { q:`Why is a shared global random number generator dangerous inside a simulation that needs to be deterministic?`,
      a:`The global generator is pulled from by particles, spawn jitter, UI, anything else running that frame, so the sequence the simulation sees depends on what else happened to run. Say the fix: the simulation owns its own generator, constructed from the seed, used in a fixed order, never shared.`,
      follow:`What else besides randomness can silently make two runs diverge?`,
      red:`Says "we seed the random generator" without addressing whether it's shared with anything else.` },
    { q:`If floating point math can differ between machines, why not just use it and add a small tolerance when comparing results?`,
      a:`A tolerance means you have stopped comparing simulations and started guessing how wrong is acceptable, and the gap compounds over thousands of ticks into a different match outcome. Name the two real fixes: fixed-point arithmetic, or floats with every function that could vary frozen and compiler fusion disabled on both sides.`,
      follow:`What would make you choose fixed point over frozen floats, or the reverse?`,
      red:`Proposes an epsilon comparison as the actual solution rather than as a symptom of a non-deterministic system.` }
  ],
  mid:[
    { q:`You're asked to add a parity test to CI for a simulation shared between client and server. What does that test actually check, and what happens when it fails?`,
      a:`Replay recorded input fixtures through both implementations and diff the resulting traces bit for bit, failing on the first differing tick and printing it. On failure, the change is rejected until a human either fixes the divergence or, in a separate reviewed change, explains what behaviour was intentionally altered and updates the golden trace. Never regenerate the trace to make the failure go away silently.`,
      follow:`Someone on the team wants to bump the golden trace in the same commit that fixed a bug. What's your objection?`,
      red:`Treats a failing parity test as something to work around rather than a signal to investigate.` },
    { q:`How would you audit an existing simulation function for hidden non-determinism?`,
      a:`Check for clock or frame-rate reads, unseeded or shared random sources, iteration over a hash map or dictionary that assumes order, and any library call whose result can vary by platform or compiler flag. Walk through how you'd find each class of bug in real code, not just list the categories.`,
      follow:`You find a call to a trig function from the platform math library. Is that automatically a problem?`,
      red:`Lists the categories from memory but can't point to what in actual code would trigger each one.` },
    { q:`Your game uses Unity's or Godot's built-in physics for movement. Can the server verify a physics-derived outcome?`,
      a:`No, not directly. The physics engine is not guaranteed deterministic across platforms, builds, or even solver iteration counts, so an outcome that came from it cannot be re-simulated and trusted. Say the actual fix: if the outcome must be verified, it has to come from a separate deterministic simulation, and the physics engine is used for feel only.`,
      follow:`What would you tell a designer who wants ragdoll physics to affect a competitive outcome?`,
      red:`Assumes physics determinism is a settings toggle rather than a fundamental limitation of most physics engines.` }
  ],
  senior:[
    { q:`You're seeing occasional desync reports in production that nobody can reproduce. How do you approach it?`,
      a:`Start from what's already instrumented: periodic state hashes logged during real matches, so a report at least narrows to a tick range instead of "sometimes." If that doesn't exist yet, add it first. Then treat "rare and not reproducible" as an unacceptable classification and push for a minimal repro from the nearest hash mismatch. Say what you'd do if the divergence traces to a compiler optimization rather than application code.`,
      follow:`The divergence only appears on one specific device model. What does that suggest, and how do you confirm it?`,
      red:`Accepts "rare, not reproducible" as a closed state without instrumenting anything new.` },
    { q:`How do you decide between fixed-point arithmetic and frozen floating point for a new deterministic simulation, and what would change your mind later?`,
      a:`Fixed point costs a rewrite of every formula and a new intuition for designers, but is trivially deterministic and holds up across any pair of runtimes. Frozen floats keep formulas readable but impose a permanent constraint on both toolchains that a compiler upgrade or new platform can reopen. Choose based on whether you control both runtimes and whether the simulation is new or ported. Name the event that would force a reconsideration: a platform you don't control entering the mix.`,
      follow:`A publisher requirement adds a third runtime you don't control. Does that change the decision?`,
      red:`Presents the choice as purely a style preference with no cost attached to either side.` }
  ] });

T('server-state-sync',{ d:'server', t:'State sync and tick rates', tag:'Send what changed, at a rate someone chose on purpose, and decide whether the client waits or guesses.',
  what:`How the authoritative state reaches the machines that only display it. Three decisions sit inside it: what you send (the whole state, a snapshot, or only the fields that changed since this client last acknowledged), how often you send it, and what the receiver does between messages. The receiver either interpolates between the last two known states and lives slightly in the past, or predicts forward from local input and reconciles when the truth arrives.`,
  why:[`Bandwidth and cost scale with what you send times how often times how many players see it. This is the single largest running cost of a realtime game.`,`Interpolation and prediction produce different games. Interpolated remote players are always behind, predicted local players sometimes rewind. Both are visible to players and both need design.`,`Tick rate sets the resolution of fairness. Two players can only be distinguished by the simulation at the granularity it ticks.`,`Outside realtime matches the same idea pays for itself: returning only the state a request actually changed turns a large response into a small one.`],
  think:{ q:[`Which state does this specific client need to see right now, and which is invisible to them at this moment?`,`Is being 100 ms behind acceptable for this entity, or must the player see it the instant they act on it?`,`What is the tick rate, who chose it, and against what measurement?`,`What does a dropped or reordered update do, and does the receiver recover on the next one or stay wrong?`,`When the server corrects a predicted position, how far can it move before the player notices, and what do they see?`],
    trade:[`Interpolation is simple, stable and always late. Prediction feels immediate and costs a reconciliation path plus every bug that lives in it.`,`A higher tick rate is more responsive and more fair, and multiplies bandwidth, server cost and client processing linearly.`,`Full snapshots are trivially correct and recover from any loss. Delta updates are far smaller and need per-client acknowledgement tracking to know what to diff against.`],
    traps:[`Replicating every property because the framework makes it one attribute. Bandwidth is spent by the field.`,`Predicting things that cannot be corrected gracefully, such as a death or a purchase. Predict movement, confirm consequences.`,`Interpolating with a buffer smaller than the real jitter, so remote entities stutter on exactly the connections that need help.`,`Measuring latency once at connect and treating it as constant.`,`Sending at the physics rate because that is where the code already lives, rather than at a rate anyone chose.`],
    good:[`You can name the bytes per second per player at the worst moment in a match, and the number came from a measurement.`,`Every replicated field exists because someone asked what breaks if it is not sent.`],
    bad:[`Remote players teleport and the fix under discussion is raising the tick rate.`,`Nobody knows what happens when three consecutive updates are lost.`] },
  how:[`List the state and mark each field: needed by whom, how stale it may be, and whether losing an update is recoverable. That list is your replication design.`,`Choose the receiver strategy per entity class, not globally. Local player predicted, remote players interpolated, world objects snapped on change.`,`Set an interpolation buffer from measured jitter, sampled continuously as a rolling average, not from a constant somebody typed once.`,`Send deltas against what the client acknowledged, and make every message either self-correcting or acknowledged. A stream of diffs with no recovery path is a desync waiting for a dropped packet.`,`Pick the tick rate deliberately and record the reasoning. Then measure bandwidth per player at the rate you chose.`,`Give reconciliation a visible design. Small corrections blended over a few frames, large ones snapped with an effect that says the server disagreed.`,`Outside the match, apply the same discipline to request responses: track what a request changed and return only that, keyed by a generation counter the client sends back.`],
  ai:{ yes:[`Turn a state list into a replication table with the per-field questions filled in, and flag fields that look like presentation.`,`Estimate bandwidth per player per second from a described message layout, tick rate and player count, showing the arithmetic.`,`Write the interpolation buffer and the rolling latency estimator, including the behaviour when samples are missing.`,`List the failure cases of a delta scheme: lost acknowledgement, reordered updates, a client that reconnects with a stale generation.`],
       no:[`Choose the tick rate. That is a cost and fairness commitment measured against your game.`,`Decide what may be predicted. Predicting the wrong thing is a design failure, not a code failure.`,`Tune the correction blend by feel. Only a player watching it can say whether it reads as responsive or broken.`] },
  prompts:[{l:'Replication table',p:`Here is the state of one match entity: [FIELDS]. Players are [N] and the match lasts [LENGTH]. For each field produce: who needs it, the maximum staleness that is acceptable, whether a lost update is self-correcting, and whether it should be predicted, interpolated or snapped. Then estimate bytes per second per player at [TICK] Hz and show the arithmetic. Mark any field that is presentation and should not be on the wire at all.`},
    {l:'Prediction failure cases',p:`We predict [ACTIONS] on the local client and reconcile against the server. Enumerate the cases where prediction and authority will disagree, including packet loss, a burst of latency, an action refused by the server, and two clients acting in the same tick. For each, state what the player sees, how the client recovers, and what would make the recovery legible rather than look like a bug.`}],
  verify:[`Is every replicated field justified by a named consumer, or is the list just the entity's public members?`,`Is the interpolation buffer derived from measured jitter, and is the measurement still running in production?`,`Does the delta scheme have a defined recovery when an acknowledgement is lost, and has that path been exercised?`],
  test:[`Measure bytes per second per player at the busiest moment of a real match, not at idle. Compare it against the budget you set before building.`,`Add 5 percent packet loss and 150 ms of jitter on one client and watch remote entities. Measure how long a visible artefact lasts and whether it self-corrects.`,`Force a reconciliation of a large distance and show it to players without telling them what happened. Ask them what they think the game did.`],
  rel:[['game-feel-and-juice','Interpolation delay and correction snap are felt as responsiveness long before anyone calls them netcode.'],['feedback-and-affordance','A correction the player cannot interpret is feedback that teaches the wrong lesson about their own input.'],['server-authority','Sync is how the authoritative decision travels. The model decides what is even worth sending.'],['server-realtime-protocol','Delta sync, acknowledgements and channel reliability are protocol decisions before they are gameplay ones.'],['backend-data-access','Returning only the tables a request dirtied is the same delta idea applied to stored player state.']],
  tech:[
    {n:'Snapshot interpolation', how:`The client buffers the last few authoritative states and renders an interpolated point between them, deliberately a fixed delay behind the server.`, fit:`Remote entities in almost every realtime game. The default until something demands otherwise.`, cost:`Everything the client sees of other players is in the past. Aiming at another player means aiming where they were.`, alt:`Extrapolation forward, which removes the delay and invents motion that did not happen.`},
    {n:'Client prediction and reconciliation', how:`The client applies local input immediately and keeps the input history. When an authoritative state arrives it rewinds to that state and replays the inputs that came after it.`, fit:`The local player's own movement, where any delay is felt as input lag.`, cost:`The whole simulation must be re-runnable and deterministic on the client. Every mispredicted action is a visible correction.`, alt:`Accept the round trip and hide it with animation wind-up, which is cheaper and only works for slow actions.`},
    {n:'Delta sync against acknowledged state', how:`The server tracks what each client last confirmed receiving and sends only the fields that changed since. Requests outside the match do the same with a dirty-set and a generation counter.`, fit:`Large state where most of it is static between updates. Inventories, world objects, player profiles.`, cost:`Per-client bookkeeping on the server and a recovery path for a lost acknowledgement. A client with a stale generation must be able to ask for everything.`, alt:`Periodic full snapshots, which cost bandwidth and never desync.`},
    {n:'Interest management', how:`Each client is sent only the entities relevant to it, chosen by distance, region, team or visibility, with the set recomputed as they move.`, fit:`Any world larger than one screen, and the first thing to reach for when bandwidth grows with player count.`, cost:`Entities entering the interest set need a full state on entry. Incorrect culling shows as objects popping into existence.`, alt:`Sending everything to everyone, which is fine until it is suddenly not.`}
  ] });
ENGINE('server-state-sync',{
  godot:{ term:`Replication is declared on a MultiplayerSynchronizer node with a SceneReplicationConfig listing the properties to send and their sync mode. MultiplayerSpawner replicates the existence of nodes, the synchronizer replicates their values.`,
    api:['MultiplayerSynchronizer.replication_config','SceneReplicationConfig.add_property() / property_set_sync()','MultiplayerSpawner.spawn_function','MultiplayerSynchronizer.replication_interval / delta_interval','Node.set_multiplayer_authority()','@rpc("authority", "unreliable_ordered")'],
    snippet:`extends CharacterBody2D

@onready var sync: MultiplayerSynchronizer = $MultiplayerSynchronizer
var net_position := Vector2.ZERO          # the replicated property

func _physics_process(delta: float) -> void:
\tif multiplayer.is_server():
\t\tvelocity = _server_step()
\t\tmove_and_slide()
\t\tnet_position = global_position
\telse:                                  # remote peers live one buffer in the past
\t\tglobal_position = global_position.lerp(net_position, 1.0 - pow(0.001, delta))`,
    pitfall:`Leaving replication_interval at 0, which sends on every physics tick. With sixty ticks a second and a handful of properties per entity, bandwidth is spent before anyone has looked at it. Set the interval per synchronizer against what that entity actually needs, and put anything that only changes on an event behind an RPC instead of a replicated property.`,
    map:`Godot MultiplayerSynchronizer is Unity NetworkTransform plus NetworkVariable, and MultiplayerSpawner is the NetworkObject spawn path.` },
  unity:{ term:`State travels as NetworkVariable fields with an explicit write permission, or through NetworkTransform for movement. The tick system gives a shared clock, and interpolation on the receiving side is a component setting rather than a value you send.`,
    api:['NetworkVariable<T>(writePerm: NetworkVariableWritePermission.Server)','NetworkVariable<T>.OnValueChanged','NetworkTransform.Interpolate / PositionThreshold','NetworkManager.NetworkTickSystem.TickRate','NetworkManager.LocalTime / ServerTime','NetworkBehaviour.OnNetworkSpawn()'],
    snippet:`public class Mover : NetworkBehaviour {
    readonly NetworkVariable<Vector3> netPos =
        new(writePerm: NetworkVariableWritePermission.Server);
    Vector3 shown;

    void FixedUpdate() {
        if (IsServer) netPos.Value = ServerStep(Time.fixedDeltaTime);
    }

    void Update() {
        if (IsServer) return;                     // remote view: interpolate, never guess
        shown = Vector3.Lerp(shown, netPos.Value, 1f - Mathf.Exp(-12f * Time.deltaTime));
        transform.position = shown;
    }
}`,
    pitfall:`Writing to a NetworkVariable every frame with a reference or struct type. The variable is dirty-checked and serialised whenever it is assigned, so an assignment of an unchanged value still costs a message. Assign only when the value actually changed, set a position threshold on NetworkTransform, and never put presentation state such as animation blend weights into a NetworkVariable.`,
    map:`Unity NetworkVariable is Godot's replicated property in a SceneReplicationConfig, and NetworkTickSystem is what you build yourself in Godot from a physics tick counter.` },
  note:`Both engines will happily replicate everything you mark, which is the trap. The design work is the replication table: per field, who needs it, how stale it may be, and whether a lost update repairs itself. The engine attribute is the last five minutes of that work.` });
INTERVIEW('server-state-sync',{
  junior:[
    { q:`What's the difference between interpolating a remote player and predicting your own player's movement?`,
      a:`Interpolation renders a point between the last two known authoritative states, so the remote player is always slightly in the past. Prediction applies local input immediately and reconciles against the authoritative answer when it arrives, so it can feel instant but sometimes has to correct itself. Say which one you'd use for the local player and which for everyone else, and why.`,
      follow:`What does a player actually see when a predicted action gets corrected?`,
      red:`Cannot say which strategy applies to the local player versus remote players.` },
    { q:`Why does tick rate matter for fairness, not just for smoothness?`,
      a:`Two players can only be distinguished by the simulation at the granularity it ticks, so a low tick rate can genuinely decide who "got there first" incorrectly. Give a concrete example, like two players reaching for the same pickup within the same tick window.`,
      follow:`If you doubled the tick rate, what would that cost, and is it worth it for that example?`,
      red:`Treats tick rate purely as a smoothness or bandwidth knob with no fairness implication.` },
    { q:`Why send only the fields that changed instead of the whole entity state every time?`,
      a:`Bandwidth is spent per field, and most of an entity's state is static between updates, so sending everything wastes cost that scales with tick rate times player count times entity count. Say what a delta scheme needs in exchange: tracking what each client last acknowledged.`,
      follow:`What happens if the client's acknowledgement gets lost?`,
      red:`Says "delta compression" without being able to explain what it's diffing against.` }
  ],
  mid:[
    { q:`How would you decide the interpolation buffer size for remote players in a real game, rather than picking a number that felt right?`,
      a:`Measure real jitter on real connections as a rolling average, and set the buffer from that measurement, not from a constant chosen once. Say what happens when the buffer is too small: stutter on exactly the connections that most need help. Describe how you'd validate the choice with players on a bad connection, not just on your office network.`,
      follow:`Your measured jitter varies wildly by region. Do you use one global buffer or one per region?`,
      red:`Picks a buffer size from a forum post and never revisits it against real telemetry.` },
    { q:`You need to estimate bandwidth per player before building the replication layer. Walk me through it.`,
      a:`List the entities and fields that must replicate, mark who needs each one and at what staleness, then multiply message size by tick rate by player count for the worst realistic moment, not idle. Flag any field that looks like it's presentation rather than gameplay state and shouldn't be on the wire at all. Show the arithmetic, don't just give a final number.`,
      follow:`Your estimate is under budget in a two-player test and over budget at twenty players. What does that tell you?`,
      red:`Gives a bandwidth number with no arithmetic behind it and no mention of what's actually being replicated.` },
    { q:`A designer wants to predict a purchase result locally for responsiveness. What's your objection?`,
      a:`Prediction only works for things that can be corrected gracefully, and a purchase or a death is not one of them, you cannot un-show a player their new item without it reading as a bug. Say what you'd predict instead, like movement, and what you'd do for the purchase, like a short wait with clear feedback that the request is in flight.`,
      follow:`What's an example of state that looks predictable but actually can't be corrected gracefully?`,
      red:`Agrees to predict the purchase and plans to "just roll it back visually" if it fails.` }
  ],
  senior:[
    { q:`Remote players are teleporting in a live game and the proposed fix is raising the tick rate. How do you respond?`,
      a:`Raising tick rate multiplies bandwidth and cost linearly and may not touch the actual cause. Ask first what happens on packet loss and whether the interpolation buffer is sized from measured jitter, because teleporting usually means updates are arriving with no recovery path or the buffer is smaller than real jitter. Describe how you'd instrument to tell the difference before spending on tick rate.`,
      follow:`You confirm the buffer is fine but three consecutive updates are being dropped on some connections. What's your fix?`,
      red:`Approves the tick rate increase without first checking whether packet loss or buffering is the real cause.` },
    { q:`Design the replication strategy for a game with a mix of a local player, twenty remote players, and a shared world of static and dynamic objects.`,
      a:`Different strategy per entity class: local player predicted with reconciliation, remote players interpolated with a jitter-derived buffer, dynamic world objects delta-synced against acknowledged state, static objects sent once on entering interest. Add interest management so a client only receives entities relevant to it. Name the corner case that breaks each strategy and how you'd catch it in testing.`,
      follow:`An object crosses from outside a client's interest set to inside it. What does that client need to receive at that exact moment?`,
      red:`Applies one replication strategy uniformly to every entity type regardless of its role.` }
  ] });

T('server-realtime-protocol',{ d:'server', t:'Realtime protocol design', tag:'A length, an op code, a message id, a payload. Everything else is a decision you should be able to defend.',
  what:`The wire format and dispatch rules of a persistent connection. A framed binary envelope carrying an op code and a message id, a schema for the payload, a rule for which messages are reliable and ordered and which may be dropped, a way to correlate a reply with the request that caused it over a socket that also pushes unsolicited events, and an authentication step that must happen before any op that touches state.`,
  why:[`The connection is stateful and long lived, so protocol mistakes are not one bad request. They corrupt a session and every message after it.`,`Op codes plus a generated schema make the protocol reviewable. A free-form message body makes every change a guess about who else is parsing it.`,`Reliability is a per-message decision. Making everything reliable and ordered converts one lost packet into a stall for every message behind it.`,`The same socket carries both replies and pushes. Without correlation ids the client cannot tell an answer from an announcement.`],
  think:{ q:[`Does this message need to arrive, and does it need to arrive in order relative to the messages around it?`,`What does the receiver do with a message whose op code it does not recognise, and is that forward compatible?`,`Which ops are legal before authentication, and is that list as short as it can be?`,`How does a reply find the caller that is waiting for it?`,`What is the largest payload this transport will carry, and what happens at one byte more?`],
    trade:[`A generated schema gives type safety, small frames and cheap evolution, and costs a code generation step in both builds plus a version to keep in step.`,`Text messages are trivially debuggable and cost bandwidth, parsing and the discipline nobody keeps.`,`One socket for everything is simple and couples chat latency to gameplay latency. Separate connections isolate them and double the connection state to manage.`],
    traps:[`Handling any stateful op before authentication has completed, because the switch statement grew a new case and nobody re-read the guard.`,`Silently upgrading an unreliable message to the reliable channel when it exceeds a size ceiling, and not saying so, so an occasional large payload quietly changes ordering.`,`Assuming a websocket message boundary equals your frame. Buffer and length-prefix, or a slow network will hand you half a message.`,`Dispatching the payload straight onto the thread the socket read it on, then touching engine objects from there.`,`Numbering op codes by insertion order in a shared enum, so two branches merge into the same value.`],
    good:[`One table lists every op code with its direction, its reliability, whether it requires auth, and its payload type.`,`A new message type is added by changing the schema and the table, and both clients fail to build until they handle it.`],
    bad:[`Message handling is a long switch with no guard and no default case.`,`Nobody can say which messages are allowed to be dropped.`] },
  how:[`Define the frame first: a length prefix, an op code, a message id, then the payload. Write it down as a table, not as a comment in the reader.`,`Generate the payload types from one schema for both sides. Never hand-write a struct on one end and hope.`,`Mark each op with its reliability and its auth requirement in the same table, and enforce auth in one place before the dispatch switch, not inside the cases.`,`Correlate replies by echoing the message id. Keep a pending map with a timeout so a lost reply fails the caller instead of hanging it.`,`Marshal onto the main thread at exactly one point, and make every handler downstream of that point assume it is there.`,`Handle unknown op codes by logging and ignoring, so an older client survives a newer server.`,`Decide the size ceiling and what happens above it, and make the degradation explicit and logged rather than automatic and silent.`,`Keep a protocol version in the handshake so an incompatible pair fails at connect with a message the player can act on.`],
  ai:{ yes:[`Draft the op-code table from a list of interactions, including direction, reliability and auth requirement.`,`Write the framing reader and writer including the partial-message buffering case and the oversized-payload case.`,`Review a protocol for ops reachable before authentication and for missing default handling.`,`Generate the reply-correlation layer with timeouts and cancellation.`],
       no:[`Decide which messages may be lost. That is a gameplay judgement about what the player would notice.`,`Design the schema evolution policy for clients you cannot force to update.`,`Assume a transport's guarantees. Verify message framing and size limits against the actual library and platform.`] },
  prompts:[{l:'Protocol table',p:`Here are the interactions our realtime connection must carry: [LIST]. Produce a table with one row per message: op code name, direction, reliable or droppable and why, whether it requires an authenticated session, payload fields, and expected frequency. Flag any message that could be handled before authentication and any pair that must be ordered relative to each other.`},
    {l:'Framing review',p:`Here is our socket read loop and frame parser: [CODE]. Check it against these cases: a message split across two reads, two messages in one read, a payload larger than the size ceiling, an unknown op code, a close arriving mid-frame, and a handler touching engine objects off the main thread. For each, say what the current code does and the smallest fix.`}],
  verify:[`Does the op-code table exist and does the code match it, or is the table a document someone wrote once?`,`Is authentication enforced before dispatch rather than inside individual handlers?`,`Is there a test that feeds the parser a message split across two reads?`],
  test:[`Fuzz the parser with truncated frames, oversized payloads and unknown op codes. Measure that the connection survives or closes cleanly, never that it silently mis-parses.`,`Send a burst of the highest-frequency message and measure main-thread time spent in dispatch. Protocol cost shows up as frame hitches before it shows up as bandwidth.`,`Connect an old client to a new server and a new client to an old server. Measure what the player is told in each direction.`],
  rel:[['platform-and-session','Transport choices are platform choices. Some targets have no raw sockets, and mobile suspend kills connections you assumed were open.'],['social-experience','Chat, presence and party channels ride this protocol, and their latency budget is not the match latency budget.'],['server-state-sync','Reliability, ordering and message size decide what sync strategies are even available.'],['server-scaling','Op codes and channels are the unit that fan-out and sharding are organised around.'],['backend-api-protocol','The request-response API and the realtime socket are two encodings of the same domain, and they should not drift apart.']],
  tech:[
    {n:'Length-prefixed binary frames with a generated schema', how:`Every message is a length, an op code, a message id and a schema-encoded payload. Types are generated for both sides from one definition.`, fit:`Production realtime with more than a handful of message types, and any team where client and server are built separately.`, cost:`A codegen step in both pipelines and a schema version to keep aligned. Debugging needs a decoder tool.`, alt:`Text messages during the first prototype week, then migrate before the message count grows.`},
    {n:'Reliable and unreliable channels', how:`The transport exposes at least two delivery modes. Position streams go unreliable and unordered, state changes go reliable and ordered, each on its own channel so a stall in one does not block the other.`, fit:`Anything with a continuous stream of positions alongside discrete events.`, cost:`Two paths to reason about, and a rule for what happens when an unreliable payload exceeds the transport's ceiling.`, alt:`All-reliable, which is simpler and turns any loss into a visible stall for everyone.`},
    {n:'Request-response over a push socket', how:`Requests carry a message id. The sender keeps a pending map keyed by that id with a timeout, and the receiver echoes it on the reply. Unsolicited pushes carry no id.`, fit:`A single connection that must serve both commands and server-initiated events.`, cost:`Bookkeeping, timeouts and cancellation on both ends. Ids must be unique for the life of the connection.`, alt:`A separate request channel over HTTP, which costs a second transport and keeps the socket purely for pushes.`},
    {n:'Op-code dispatch with an auth gate', how:`One switch on the op code, preceded by a single guard that rejects every stateful op on a connection that has not authenticated. Unknown codes are logged and ignored.`, fit:`Every persistent connection that carries identity.`, cost:`The guard must be the only entry point, which needs discipline as handlers are added.`, alt:`Per-handler checks, which is the arrangement that eventually ships with one handler missing its check.`}
  ] });
ENGINE('server-realtime-protocol',{
  godot:{ term:`For a custom protocol you drop below MultiplayerAPI and drive a WebSocketPeer yourself, polling it each frame and reading whole packets. The byte layout is yours, encoded with the PackedByteArray encode and decode helpers.`,
    api:['WebSocketPeer.connect_to_url() / poll() / get_ready_state()','WebSocketPeer.get_available_packet_count() / get_packet() / put_packet()','PackedByteArray.encode_u16() / decode_u32() / slice()','WebSocketPeer.set_no_delay()','ENetMultiplayerPeer channel argument for reliable and unreliable sends','Node._process(delta) as the poll pump'],
    snippet:`extends Node
var ws := WebSocketPeer.new()             # connected in _ready with connect_to_url

func _process(_d: float) -> void:
\tws.poll()
\twhile ws.get_available_packet_count() > 0:
\t\tvar f := ws.get_packet()          # [2 op code][4 message id][payload]
\t\t_dispatch(f.decode_u16(0), f.decode_u32(2), f.slice(6))

func send(op: int, id: int, body: PackedByteArray) -> void:
\tvar head := PackedByteArray()
\thead.resize(6)
\thead.encode_u16(0, op)
\thead.encode_u32(2, id)
\tws.put_packet(head + body)`,
    pitfall:`Forgetting to call poll() every frame, or calling it only when you expect a message. WebSocketPeer does no work of its own, so without the pump the connection never finishes its handshake, never delivers packets and never reports that it closed. The matching mistake is reading a single packet per frame instead of draining the queue, which turns a burst into a growing backlog.`,
    map:`Godot's WebSocketPeer poll loop is Unity's async ReceiveAsync loop, and PackedByteArray.encode_u16 is BitConverter or a BinaryWriter.` },
  unity:{ term:`A custom socket lives outside the player loop in an async read task. Frames are parsed from a buffer and then marshalled back to the main thread with the captured SynchronizationContext before any engine object is touched.`,
    api:['System.Net.WebSockets.ClientWebSocket.ReceiveAsync() / SendAsync()','SynchronizationContext.Current / Post()','CancellationTokenSource','BitConverter / System.Buffers.Binary.BinaryPrimitives','UnityWebRequest for the request-response tier','Application.focusChanged and OnApplicationPause for socket teardown'],
    snippet:`async Task ReadLoop(ClientWebSocket ws, SynchronizationContext ctx, CancellationToken ct) {
    var buf = new byte[8192];
    while (ws.State == WebSocketState.Open) {
        var r = await ws.ReceiveAsync(new ArraySegment<byte>(buf), ct);
        if (!r.EndOfMessage) { Grow(buf, r); continue; }     // frames can split
        if (r.MessageType != WebSocketMessageType.Binary) continue;
        ushort op = BitConverter.ToUInt16(buf, 0);           // [2 op][4 id][payload]
        uint id = BitConverter.ToUInt32(buf, 2);
        var body = new ArraySegment<byte>(buf, 6, r.Count - 6).ToArray();
        ctx.Post(_ => Dispatch(op, id, body), null);         // back to the main thread
    }
}`,
    pitfall:`Touching a GameObject, a Transform or anything else from the receive task. The callback runs on a thread pool thread, Unity's API is main-thread only, and the failure is not always an exception. It can be a silent no-op or a crash minutes later. Post every dispatch through the SynchronizationContext captured on the main thread, and make that the only place the boundary is crossed.`,
    map:`Unity's SynchronizationContext.Post is what Godot gives you for free by polling inside _process, which is already the main thread.` },
  note:`This is the client half of a server protocol, and the two must be generated from one schema. The op-code table, the reliability column and the auth gate live on the server. The client's job is to frame correctly, drain the queue, correlate replies by message id and cross the thread boundary exactly once.` });
INTERVIEW('server-realtime-protocol',{
  junior:[
    { q:`What goes into a message frame on a persistent connection, and why does each part matter?`,
      a:`A length prefix so the reader knows where the message ends, an op code so the receiver knows what it is, a message id so a reply can be matched to its caller, and the payload. Say what breaks if the length prefix is missing: a slow network can hand you half a message and the reader has no way to know.`,
      follow:`What should the reader do if it receives an op code it doesn't recognise?`,
      red:`Describes the payload only and has no answer for how the reader knows where one message ends.` },
    { q:`Why can't every message on a realtime connection be both reliable and ordered?`,
      a:`Making everything reliable and ordered means one lost packet stalls every message behind it, including ones where staleness would have been harmless, like a position update. Say which kind of message you'd mark unreliable and why losing it occasionally is fine.`,
      follow:`Give an example of a message that must be ordered relative to another specific message, and why.`,
      red:`Treats "reliable" as simply "better" and can't name a cost to using it everywhere.` },
    { q:`Why does an op code need to be checked against authentication state before it's handled?`,
      a:`A persistent connection is stateful, so a mistake here isn't one bad request, it lets a stateful action through before identity is confirmed. Say where that check should live: one guard before the dispatch switch, not scattered inside individual handlers.`,
      follow:`What's the smallest set of op codes that should be legal before authentication completes?`,
      red:`Puts the auth check inside each handler and calls that "defense in depth."` }
  ],
  mid:[
    { q:`Walk me through how you'd design the op-code table for a new realtime feature before writing any code.`,
      a:`One row per message: direction, reliability with a stated reason, whether it requires authentication, payload shape, expected frequency. Flag anything that could be reached before authentication and any pair of messages that must stay ordered relative to each other. Say why this table has to exist as reviewable data, not as knowledge in someone's head.`,
      follow:`Two messages need to be ordered relative to each other but you've put them on separate channels. What do you do?`,
      red:`Jumps to code before there's an agreed table anyone else can review.` },
    { q:`How do you correlate a reply with the request that caused it, on a socket that also pushes unsolicited events?`,
      a:`Requests carry a message id. The sender keeps a pending map keyed by that id with a timeout, and the receiver echoes the id back on the reply. Unsolicited pushes carry no id, so the client can tell the two apart. Say what happens on a timeout: the caller fails rather than hangs.`,
      follow:`What happens if a reply arrives after its request already timed out?`,
      red:`Assumes every message on the socket is a reply and has no path for unsolicited pushes.` },
    { q:`You're reviewing a socket read loop. What are the specific bugs you'd check for?`,
      a:`A message split across two reads, two messages arriving in one read, a payload above the size ceiling with no defined behaviour, an unknown op code crashing the parser instead of being logged and ignored, and a handler touching engine objects off the thread that read the socket. Walk through how each shows up in real code.`,
      follow:`You find the parser silently upgrades an oversized unreliable message to the reliable channel. Why is that dangerous even though it "recovers" the message?`,
      red:`Reviews the happy path only and doesn't mention partial frames or oversized payloads.` }
  ],
  senior:[
    { q:`You need an old client to keep working against a new server for weeks after a protocol change ships. How do you design for that?`,
      a:`Generate payload types from one schema so evolution is additive: new fields, never renumbered or removed identifiers. Make unknown op codes a logged no-op rather than a failure, so an old client surviving a new op set doesn't break. Put a protocol version in the handshake so a genuinely incompatible pair fails at connect with an actionable message rather than mid-session.`,
      follow:`A field needs to be removed entirely, not just deprecated. What's the actual process?`,
      red:`Plans to force every client to update immediately instead of designing for coexistence.` },
    { q:`Chat and gameplay currently share one socket and one channel. Players report chat lag spikes during intense combat. How do you diagnose and fix it?`,
      a:`Name the coupling directly: one socket means chat latency is coupled to gameplay latency and to whatever's saturating the connection during combat. Diagnose by measuring main-thread dispatch time and per-channel volume during a busy moment, not by guessing. Propose separating channels or connections so combat traffic can't starve chat, and name the cost: doubled connection state to manage.`,
      follow:`Splitting into two connections doubles the reconnection logic you have to maintain. Is it still worth it here?`,
      red:`Proposes raising priority on chat messages without addressing the shared channel's fan-out cost.` }
  ] });

T('server-matchmaking',{ d:'server', t:'Matchmaking, rooms and sessions', tag:'A ticket, a rule set, a room, and an explicit answer to what happens when someone disappears.',
  what:`Getting the right players into the same session and keeping that session coherent. A ticket carries who is waiting, what capacity the match needs, and the predicates a candidate set must satisfy. A matcher scans open tickets for a satisfying group and hands them to something that creates the session. Around that sit private rooms with join codes, the lifetime rules for a session, and a deliberate policy for disconnection and reconnection.`,
  why:[`Match quality is the first thing players feel about a multiplayer game, and it is a design problem before it is an algorithm.`,`Wait time and match quality trade against each other directly, and the trade has to be chosen rather than emerge from a queue.`,`Session lifetime bugs are the expensive kind. A room that outlives its players costs money forever and a room that dies early loses a match in progress.`,`Reconnection is a product decision with a real cost. Deciding not to support it is legitimate and must be decided, not discovered.`],
  think:{ q:[`What makes a match good for this game: skill, latency, party size, mode, language, or a rule the designers wrote?`,`How long will a player wait before the queue is worse than a bad match, and what do we relax first?`,`Who creates the session, and what is the state of the world between the match being decided and the players being connected?`,`If a player's app is suspended for thirty seconds, is their seat still theirs, and for how long?`,`How is a private room addressed, and can a player from one environment accidentally join a room in another?`],
    trade:[`Strict predicates give better matches and longer queues. Widening over time fills matches and shows players a worse one late at night.`,`Holding a seat for a disconnected player protects them and degrades the match for everyone still there.`,`Reconnection support is a genuine feature with its own state machine. Treating a disconnect as a session death is far simpler and loses the player's match.`],
    traps:[`Sharing one application id between development and live builds, so a room code generated by a test build collides with a real one. A single-character environment tag on the code is the cheap fix.`,`A matcher that scans a shared ticket list without a lock, or with a lock held across a network call.`,`Tying the session's lifetime to a scene. Loading a new scene destroys the object holding the connection.`,`Leaving a room allocated because the last player left through a path that does not run the cleanup.`,`Assuming an operating system suspend is a brief pause. On mobile it can be the end of the process, and the session it owned is already gone.`],
    good:[`A queue report shows median wait and the distribution of how far predicates had to be relaxed.`,`You can describe what happens at every second of a thirty-second disconnect, and someone has watched it.`],
    bad:[`Empty rooms accumulate and are cleaned up by a periodic sweep nobody wants to remove.`,`Players report being matched with someone on another continent and the team has no latency predicate at all.`] },
  how:[`Model the ticket explicitly: the party, the capacity it needs, the predicates it demands, when it entered the queue, and how far it has already been relaxed.`,`Write the relaxation ladder as data. After N seconds widen skill, after M seconds widen latency, and never widen mode. Make the ladder visible in the queue report.`,`Keep the matcher's scan over the ticket pool short and never hold its lock across a call that can block.`,`Make session creation a single owner. One component allocates the room, hands out its address, and is the only thing that can destroy it.`,`Tag room codes with the environment before they become a session name, so two environments sharing one service cannot collide.`,`Decide the disconnect policy in writing and implement exactly it. If a suspend means session death, tear the session down immediately so no dead session can still be operated.`,`Give the session an owner whose lifetime is the session, not the scene, and make cleanup run on every exit path including the crash path.`,`Instrument the queue: tickets in, wait time, relaxation depth, matches formed, abandoned tickets. Without it match quality is an opinion.`],
  ai:{ yes:[`Turn a description of a good match into explicit predicates and a relaxation ladder with times.`,`Enumerate the session lifecycle states and the transitions between them, including every disconnect and error path.`,`Review a matcher for lock scope, starvation of long-waiting tickets, and unbounded queue growth.`,`Simulate wait time and match quality against a described population and predicate set, stating its assumptions about arrival rate.`],
       no:[`Decide what a good match is. That is the game's promise about fairness and company.`,`Choose the reconnection policy. It is a product decision with support, fairness and engineering cost.`,`Estimate your real population. Any number it gives you is invented unless you supplied the data.`] },
  prompts:[{l:'Ticket and ladder',p:`Our match needs [CAPACITY] players in mode [MODE]. What makes a match good for us is [CRITERIA]. Turn that into an explicit ticket structure and a relaxation ladder: which predicate widens at which waiting time, by how much, and which predicates never widen. Then list the failure cases: a party too large for the remaining slots, a ticket that has waited beyond the ladder, and a player who cancels while being matched.`},
    {l:'Session lifecycle',p:`Describe the full session lifecycle for this shape: [TOPOLOGY], created by [OWNER], with a disconnect policy of [POLICY]. Enumerate every state and transition including app suspend, network loss, graceful leave, host leave, crash, and the last player leaving. For each transition say who destroys the room, what the remaining players see, and what is left allocated if the transition is missed.`}],
  verify:[`Is the relaxation ladder data someone can read and change, or is it constants inside the matcher?`,`Does every exit path from a session run the same cleanup, including the crash and suspend paths?`,`Are room codes namespaced per environment, and has someone tried to join across environments?`],
  test:[`Measure median and 95th percentile queue time by hour, together with how far the ladder had to relax. A short queue that always relaxes fully is a bad match served fast.`,`Suspend a client mid-match for five, thirty and three hundred seconds. Measure exactly what the player and the other players see at each, against the policy you wrote.`,`Run a load test that creates and abandons sessions on every exit path, then count allocated rooms afterwards. The number should return to zero.`],
  rel:[['social-experience','Who you are matched with is the social experience, and a private room code is the whole feature for friends playing together.'],['return-and-quit','A queue that is too long or a match that is too one-sided is one of the most common reasons a player stops coming back.'],['server-scaling','Rooms are the unit that gets distributed, so the matchmaker and the shard layout are one design.'],['server-authority','The matcher hands players to something that becomes the authority, and which machine that is was decided by the authority model.'],['infra-deploy-models','A session is a stateful process with a lifetime, which is the hardest shape to deploy and the one that decides your platform.']],
  tech:[
    {n:'Ticket pool with rule predicates', how:`Every waiting party becomes a ticket with a capacity and a list of predicates. A matcher periodically scans open tickets for a set that satisfies everyone's predicates and forms a match.`, fit:`Most games. It expresses skill, latency, mode and party rules uniformly.`, cost:`The scan is quadratic in the worst case and needs a lock or a single owner. Long-waiting tickets starve without an explicit ladder.`, alt:`First come first served into the next open room, which is fine when the only predicate is capacity.`},
    {n:'Private rooms with join codes', how:`One player creates a room and receives a short code. Others type it. The code is prefixed with an environment tag before becoming the session name.`, fit:`Friends playing together, playtests, tournaments, anything where the player chooses the company.`, cost:`Short codes collide and must be reserved and expired. Without an environment tag, builds sharing one service can cross over.`, alt:`Invite links, which remove typing and require a platform that can deliver them.`},
    {n:'Relay and lobby services', how:`A hosted service holds the session list, allocates a relay so neither peer needs a public address, and handles discovery and join.`, fit:`Host mode and peer topologies, small teams, platforms behind carrier-grade network address translation.`, cost:`A per-session and per-byte bill, a dependency on someone else's availability, and limited control over placement.`, alt:`Dedicated servers you allocate yourself, which cost more to operate and give you the routing.`},
    {n:'Suspend as session death', how:`Any operating system suspend during a session tears the session down immediately rather than attempting to resume it.`, fit:`Mobile and handheld titles where a suspend is usually the end of the process anyway, and matches are short.`, cost:`A player who takes a call loses the match. Design has to make that survivable.`, alt:`A held seat with a timeout and a reconnect handshake, which is a real state machine and needs the authority to keep simulating without the player.`}
  ] });
ENGINE('server-matchmaking',{
  godot:{ term:`Godot ships the transport and not the matchmaker. You call your own service over HTTPRequest, get back an address and a session identity, then create an ENetMultiplayerPeer client against it and let MultiplayerAPI take over.`,
    api:['HTTPRequest.request() / request_completed signal','ENetMultiplayerPeer.create_client(host, port) / create_server()','MultiplayerAPI.multiplayer_peer','MultiplayerAPI.peer_connected / peer_disconnected / server_disconnected','SceneMultiplayer.auth_callback / complete_auth()','JSON.parse_string()'],
    snippet:`extends Node

func join(code: String) -> void:          # code carries an env tag: "d7Q4KP"
\t$Http.request_completed.connect(_on_ticket, CONNECT_ONE_SHOT)
\t$Http.request(MATCH_URL + "?code=" + code.uri_encode())

func _on_ticket(_r, _code, _h, body: PackedByteArray) -> void:
\tvar t: Dictionary = JSON.parse_string(body.get_string_from_utf8())
\tvar peer := ENetMultiplayerPeer.new()
\tif peer.create_client(t.host, int(t.port)) != OK:
\t\t_show_join_failed(); return
\tmultiplayer.server_disconnected.connect(_end_session)   # decide this, do not skip it
\tmultiplayer.multiplayer_peer = peer`,
    pitfall:`Putting the node that owns multiplayer_peer inside the gameplay scene. Loading the match scene frees that node, which drops the peer in the middle of joining, and the symptom looks like a flaky server. The session owner belongs on an autoload or on a node explicitly kept across scene changes, with its lifetime tied to the session rather than to the level.`,
    map:`Godot's HTTPRequest to your own matchmaker plus ENetMultiplayerPeer is what Unity's Lobby and Relay services, or a Fusion NetworkRunner.StartGame call, package for you.` },
  unity:{ term:`A runner object owns the session. You start it in a host or client mode against a session name, and the SDK's lobby and relay services handle discovery and traversal, so the room code is really a session name you construct.`,
    api:['NetworkRunner.StartGame(StartGameArgs)','GameMode.Host / GameMode.Client','StartGameArgs.SessionName / PlayerCount','NetworkRunner.SessionInfo / GetSessionList','NetworkManager.OnClientDisconnectCallback','Object.DontDestroyOnLoad(runner.gameObject)'],
    snippet:`async Task<StartGameResult> Join(string roomCode, bool asHost) {
    var runner = gameObject.AddComponent<NetworkRunner>();
    runner.ProvideInput = true;
    DontDestroyOnLoad(gameObject);                 // session outlives the scene
    return await runner.StartGame(new StartGameArgs {
        GameMode    = asHost ? GameMode.Host : GameMode.Client,
        SessionName = EnvTag + roomCode,           // dev and live share one app id
        PlayerCount = 10,
        SceneManager = gameObject.AddComponent<NetworkSceneManagerDefault>()
    });
}`,
    pitfall:`Using the raw room code as the session name while development and production builds share one application id. A tester's six-digit code can collide with a real player's, and two builds that cannot understand each other end up in the same room. Prefix the code with a one-character environment tag before it becomes the session name, and never show that character to the player.`,
    map:`Unity's StartGameArgs.SessionName is the session identity your Godot matchmaker would hand back next to the host and port.` },
  note:`The engine gives you joining. Matchmaking is the server's ticket pool, its relaxation ladder and its disconnect policy, none of which live in the client. The one thing the client must get right is lifetime: the object holding the session survives scene loads, and every exit path tears the session down exactly once.` });
INTERVIEW('server-matchmaking',{
  junior:[
    { q:`What information does a matchmaking ticket actually need to carry?`,
      a:`Who's waiting (including party size), the capacity the match needs, the predicates a candidate group must satisfy, and when it entered the queue. Say why the entry time matters: without it you can't build a relaxation ladder or know who's waited too long.`,
      follow:`What would you add to the ticket for a game with a skill rating?`,
      red:`Describes matchmaking as "the algorithm that finds two players" with no mention of what data it operates on.` },
    { q:`Why would a matchmaker deliberately widen its criteria the longer someone waits, instead of always matching strictly?`,
      a:`Strict predicates give a better match and a longer queue, so a fixed ladder trades match quality for wait time on purpose, on a schedule someone chose, rather than leaving players waiting indefinitely for a perfect match. Give an example: skill widens after some seconds, but mode never widens.`,
      follow:`Which predicate would you never widen, no matter how long someone's waited, and why?`,
      red:`Treats wait time as something to minimize at all costs with no floor on match quality.` },
    { q:`What's the difference between a public matchmaking queue and a private room with a join code?`,
      a:`A queue matches strangers by predicates; a private room lets a player choose their own company via a code. Say a real risk with room codes: they can collide, especially across a test build and a live build sharing infrastructure.`,
      follow:`How would you make a short room code safe to reuse across environments?`,
      red:`Cannot explain why a short join code needs an environment tag or expiry.` }
  ],
  mid:[
    { q:`Design the relaxation ladder for a game where a good match means similar skill and low latency. What would you actually write down?`,
      a:`A schedule: which predicate widens at which wait time, by how much, and which predicates never widen at all, expressed as data someone can read and change, not constants buried in the matcher. Say how you'd validate it: a queue report showing median wait alongside how far the ladder had to relax, so a short queue that always fully relaxes is visible as a bad-match problem, not a success.`,
      follow:`Your ladder widens skill but never latency, and players in one region complain about laggy matches. What do you change?`,
      red:`Builds a ladder with no visibility into how often it actually relaxes in production.` },
    { q:`Walk me through the full session lifecycle for a match, including every way it can end badly.`,
      a:`Created, players join, played, and ended by a graceful finish, a host leaving, a network drop, a crash, or the last player leaving. For each, name who tears the session down and what's left allocated if that step is skipped. Say why the exit paths matter more than the happy path: an empty room that isn't cleaned up costs money forever.`,
      follow:`Which of those exit paths is easiest to accidentally skip, and how would you catch it?`,
      red:`Describes only the happy-path lifecycle and treats cleanup as an afterthought.` },
    { q:`A player's app is suspended for thirty seconds mid-match. What should happen, and who decides?`,
      a:`Say this is a genuine product decision, not just an engineering default: either the seat is held with a timeout and reconnect handshake, or the suspend is treated as session death immediately. Both are legitimate, but it has to be decided and written down, and the choice depends on platform and match length. Say which you'd pick for a short mobile match versus a long PC match.`,
      follow:`If you choose to hold the seat, what does the rest of the match see for those thirty seconds?`,
      red:`Assumes reconnection support is free to add later without pricing the state machine it needs.` }
  ],
  senior:[
    { q:`Queue times are short but players complain matches feel unbalanced. What's your diagnosis process?`,
      a:`Look at the relaxation ladder's actual behaviour in production, not its design intent: a short queue that always fully relaxes is a bad match served fast, which is exactly this symptom. Pull the queue report for relaxation depth by hour and correlate with complaint timing. Say what you'd change first: not the algorithm, the ladder's schedule or the population's arrival rate assumptions.`,
      follow:`The relaxation depth is fine during the day and terrible at 2am. What does that tell you, and what's the actual fix?`,
      red:`Proposes tuning the matching algorithm itself before checking what the ladder is actually doing.` },
    { q:`You're scaling matchmaking to a much larger population across regions. What breaks first, and how do you find out before it breaks in production?`,
      a:`Name the concrete risks: a matcher holding a lock across a network call, a shared ticket list that starves long-waiting tickets, and session placement that doesn't account for regional latency. Say you'd load test with realistic arrival patterns and concurrent session creation, not synthetic requests per second, and instrument relaxation depth and wait distribution before the population actually grows.`,
      follow:`Load testing shows the matcher is fine under load but session creation is the bottleneck. Does that change your rollout plan?`,
      red:`Assumes the existing matcher scales linearly without load testing session creation and placement separately.` }
  ] });

T('server-scaling',{ d:'server', t:'Scaling a game server', tag:'Stateless parts scale by adding copies. The stateful parts are the whole problem.',
  what:`Making the server hold more concurrent players than one process can. The request-serving layer is stateless and scales by adding instances behind a load balancer. Rooms, sessions and live connections are stateful and must be placed somewhere findable, with a directory that maps a room to the instance holding it. Messages that must reach players spread across instances go through a pub/sub layer, usually sharded, and player data itself can be partitioned into independent worlds when a single database stops keeping up.`,
  why:[`A realtime game's cost is dominated by concurrent connections and running sessions, not by requests per second.`,`Stateful instances cannot be replaced freely. Every deploy, crash and scale-down decision has to answer what happens to the sessions on that instance.`,`Fan-out is where an innocent feature becomes a cost. A message to a channel with ten thousand subscribers is ten thousand deliveries.`,`Partitioning changes the game's design. Players in different worlds cannot see each other, and that is a product decision dressed as an infrastructure one.`],
  think:{ q:[`Which part of this server holds state that would be lost if the process died right now?`,`How does a client find the instance holding its room, and what happens if that instance is gone by the time it connects?`,`What is the largest fan-out a single message can cause, and who can trigger it?`,`Can we scale down, or does every instance hold sessions that must drain first?`,`If players are partitioned into worlds, which features must still work across them, and what does that cost?`],
    trade:[`Stateless everywhere is trivially scalable and pushes every bit of state into a store you now call on every request.`,`Sharding the pub/sub layer removes the single-node ceiling and means a subscriber set is spread across nodes, so any operation over all subscribers becomes a fan-in across shards.`,`World partitioning is the cheapest way to multiply capacity with unchanged code and permanently splits the population.`],
    traps:[`Holding session state in process memory and also running more than one instance, with nothing to route a returning client back to the right one.`,`Treating a pub/sub node restart as transparent. Subscriptions live on the node, so a reconnect that does not re-subscribe leaves a client silently receiving nothing.`,`Broadcasting presence updates to a whole region because the channel granularity was never revisited after the population grew.`,`Scaling down by terminating instances, killing live matches, and calling it a capacity saving.`,`Sharding by a key that is not uniform, so one shard carries most of the traffic.`],
    good:[`A deploy drains sessions instead of killing them, and you can watch the drain.`,`Someone can state the current concurrent-session capacity per instance and where that number came from.`],
    bad:[`Capacity planning is a guess and the answer to load is a bigger machine.`,`A single channel exists that everybody subscribes to.`] },
  how:[`Split the server by state, not by feature. Stateless request handling scales horizontally. Session-holding processes are a separate deployment with their own lifecycle.`,`Give rooms a directory. A client asks where its room lives and gets an address, so placement can change without the client knowing the topology.`,`Shard the pub/sub layer by a hash of the channel name so a channel always lands on a known node, and make the client re-subscribe on every reconnect rather than assuming the server remembered.`,`Design channel granularity against the fan-out it causes. A channel per room is cheap, a channel per region is a load test you ship.`,`Bound capacity from configuration rather than code: room size, rooms per instance, subscribers per channel, so they can be changed without a release.`,`Make scale-down a drain. Stop accepting new sessions on an instance, wait for the existing ones to end, then terminate.`,`If you partition into worlds, select the partition from one environment value that picks both the configuration and the data location, so the code path stays identical.`,`Track concurrent sessions, connections and fan-out volume per instance continuously. Capacity you have not measured is capacity you do not have.`],
  ai:{ yes:[`Estimate fan-out and message volume from a described channel layout and population, showing the arithmetic.`,`Review a subscription flow for the reconnect case and for orphaned subscriptions after a node restart.`,`Draft the drain procedure for a stateful instance, including what happens to a session that outlasts the drain window.`,`Propose partitioning keys for a given access pattern and name where each one produces hot spots.`],
       no:[`Decide whether the population is partitioned. That changes what the game is for the players inside it.`,`Predict your concurrency. Any number without your telemetry behind it is fiction.`,`Sign off a capacity plan. Only a load test against the real topology does that.`] },
  prompts:[{l:'Fan-out budget',p:`Our channel layout is: [CHANNELS] with expected subscribers [NUMBERS] and message rates [RATES]. Compute deliveries per second per channel and in total, show the arithmetic, and identify the channel that dominates. Then propose two changes to granularity that reduce the dominant number, with what each one costs in features or latency.`},
    {l:'Stateful drain review',p:`We run [N] instances each holding up to [M] live sessions of typical length [LENGTH]. Describe a deploy and scale-down procedure that does not kill a session in progress. Cover: stopping new placement, the drain window, sessions that outlast it, a crash during drain, and how the room directory stays correct throughout. State what the player sees in each case.`}],
  verify:[`Does the client re-subscribe to every channel after a reconnect, or does it trust the server to have remembered?`,`Is capacity bounded by configuration you can change without a release?`,`Does the room directory survive an instance disappearing, or does it hand out addresses that are already dead?`],
  test:[`Load test with concurrent sessions, not with requests per second. Measure sessions per instance at the point where latency degrades, and use that as the capacity number.`,`Restart a pub/sub node during a busy session and measure how long clients stop receiving messages and whether they recover without a manual reconnect.`,`Run a deploy during a live match and measure whether any session was cut, how long the drain took, and how many rooms were left allocated afterwards.`],
  rel:[['live-operations','Capacity, deploys and drains are live operations work, and they are what a launch day actually consists of.'],['metrics-and-success','Concurrent sessions, fan-out volume and drain duration are the metrics that tell you whether the architecture is holding.'],['server-matchmaking','Where a room is placed and how it is found is the other half of the matchmaker.'],['server-realtime-protocol','Channels and op codes are the unit that fan-out is measured in.'],['infra-data-stores','Partitioning, replicas and queues are the storage side of the same scaling decision.']],
  tech:[
    {n:'Stateless request tier plus stateful session tier', how:`Two deployments. The request tier holds nothing between calls and scales by copies. The session tier owns live rooms and scales by placement and draining.`, fit:`Any game with both an out-of-match service and live matches.`, cost:`Two lifecycles, two deploy procedures, and a directory that maps rooms to instances.`, alt:`One process doing both, which is simpler and means every deploy kills every match.`},
    {n:'Sharded pub/sub fan-out', how:`Channels are distributed across nodes by a hash of the channel name. Each server instance subscribes on behalf of its connected clients, with reconnect and retry on node failure.`, fit:`Chat, presence, notifications and any message that must reach players spread across instances.`, cost:`Subscriber sets are spread, so counting or enumerating all subscribers of a channel becomes a fan-in. Node failure needs explicit re-subscription.`, alt:`A single node, which is simpler and has a hard ceiling you will reach without warning.`},
    {n:'World or shard partitioning', how:`An environment value selects both the configuration and the data location for a partition of players. The same code serves every partition and the partitions never share state.`, fit:`Large player populations, regional deployments, and games where meeting everyone is not the point.`, cost:`Cross-partition features must be built separately or given up. Moving a player between partitions is a migration.`, alt:`A single shared world with a database that has to keep up, which preserves the design and raises the storage problem.`},
    {n:'Capacity from master configuration', how:`Room size, rooms per instance, channel limits and rate ceilings are read from configuration at boot rather than compiled in.`, fit:`Live games where an event changes the shape of load faster than a release cycle.`, cost:`Configuration becomes a production surface with its own review and audit needs.`, alt:`Constants in code, which are safe from accidents and need a deploy for every adjustment.`}
  ] });
ENGINE('server-scaling',{
  godot:{ term:`The client's share of scaling is routing and re-subscription. It asks a directory where its room lives instead of holding an address, and it treats every reconnect as a peer that has forgotten it.`,
    api:['HTTPRequest for the room directory call','WebSocketPeer.get_ready_state() / STATE_CLOSED','MultiplayerAPI.server_disconnected','Timer with exponential backoff','Array[String] of active channel names','ProjectSettings for the directory endpoint per build'],
    snippet:`extends Node

var _channels: Array[String] = []
var _last_seq := 0

func subscribe(ch: String) -> void:
\t_channels.append(ch)
\tNet.send(OP_SUBSCRIBE, ch)

func _on_socket_reopened() -> void:        # a shard restarted or we were moved
\tfor ch in _channels:
\t\tNet.send(OP_SUBSCRIBE, ch)         # the server did not remember you
\tNet.send(OP_RESYNC, str(_last_seq))    # ask for what was missed`,
    pitfall:`Caching the room's host and port and reconnecting straight to it. Room placement moves when an instance drains or dies, so the cached address outlives the room and the player lands on a closed port or, worse, on an unrelated instance. Always re-ask the directory on reconnect and treat the address as valid only for the current connection.`,
    map:`Godot's directory call plus manual re-subscription is what a managed relay service does invisibly in Unity, and the resync sequence number is your own version of a NetworkVariable's initial state sync.` },
  unity:{ term:`The client resolves its shard through a route call and reopens against whatever endpoint comes back, replaying its subscriptions. Nothing about the topology is compiled into the build.`,
    api:['UnityWebRequest for the route call','ClientWebSocket.ConnectAsync(uri, ct)','Application.internetReachability','NetworkRunner.SessionInfo.Region','PlayerPrefs for the last-seen sequence only','CancellationTokenSource for teardown on route change'],
    snippet:`public class ShardRouter : MonoBehaviour {
    readonly List<string> channels = new();
    long lastSeq;

    public async Task Connect() {
        var route = await Api.Post<RouteResponse>("/session/route");  // never hardcoded
        await socket.Open(route.Endpoint);
        foreach (var ch in channels) socket.Send(Op.Subscribe, ch);
        socket.Send(Op.Resync, lastSeq);       // the shard has no memory of us
    }

    public void OnClosed() => _ = Connect();   // re-route, do not reuse the endpoint
}`,
    pitfall:`Building region or shard selection into the client as a dropdown backed by constants. Every capacity change then needs a client release, and players on old builds keep connecting to instances you are trying to drain. Let the server decide placement and return it, and keep the client's only knowledge the address of the directory itself.`,
    map:`Unity's route call returning an endpoint is the same directory lookup a Godot client makes with HTTPRequest before creating its peer.` },
  note:`Scaling is a server topic and this is the client contract it depends on: never cache an endpoint, always re-subscribe after a reconnect, and carry a sequence number so the server can tell you what you missed. A client that assumes the server remembered it is the reason a shard restart looks like a total outage.` });
INTERVIEW('server-scaling',{
  junior:[
    { q:`Why can't you scale a stateful game server the same way you scale a stateless API?`,
      a:`A stateless request handler holds nothing between calls, so adding a copy behind a load balancer just works. A room or session holds live state in one process, so a client has to find the specific instance holding it, and killing that instance kills the match. Give the concrete consequence: you need a directory that maps a room to its instance.`,
      follow:`What happens to a client if the instance holding its room disappears before it connects?`,
      red:`Proposes "just add more servers" without distinguishing stateless from stateful load.` },
    { q:`What is fan-out, and why can an innocent feature become an expensive one because of it?`,
      a:`Fan-out is the multiplication of one message into deliveries, one per subscriber. Give the concrete example: a message to a channel with ten thousand subscribers is ten thousand deliveries, so a channel granularity chosen without thinking about population size can turn a small feature into a load test you ship by accident.`,
      follow:`How would you redesign a channel that's grown too large without breaking the feature it serves?`,
      red:`Describes fan-out as a networking detail with no cost implication.` },
    { q:`Why would a game split its player population into separate "worlds" or shards?`,
      a:`It multiplies capacity with unchanged code, because each partition runs the same system with its own resources. Say the real cost, and be honest that it's a product decision, not just an infrastructure one: players in different partitions can't see or play with each other unless you build something across the boundary.`,
      follow:`What feature would you have to build specially if two friends land in different worlds?`,
      red:`Treats partitioning as a purely technical scaling knob with no product consequence.` }
  ],
  mid:[
    { q:`How do you deploy a new server version without killing matches that are in progress?`,
      a:`Describe a drain: stop routing new sessions to an instance, wait for its existing sessions to end naturally within a window, then terminate it. Say what has to be decided explicitly: what happens to a session that outlasts the drain window, and how the room directory stays correct the whole time so no client is handed a dead address.`,
      follow:`A session is still running after the drain window expires. What are your actual options, and what would you pick?`,
      red:`Describes a deploy as "just restart the instances" with no mention of sessions in flight.` },
    { q:`Your pub/sub layer is sharded across nodes. What has to happen when one node restarts?`,
      a:`Subscriptions live on the node, so they don't survive a restart automatically, meaning every affected client has to re-subscribe rather than assume the server remembered it. Say the failure mode if this isn't handled: a client silently stops receiving messages with no error anywhere. Describe how you'd detect that in testing before players do.`,
      follow:`How would a client even know it needs to re-subscribe if the reconnect appears successful?`,
      red:`Assumes subscriptions survive a node restart without checking the actual library's behaviour.` },
    { q:`How would you set capacity limits, like room size or connections per instance, so an event doesn't require a release to adjust them?`,
      a:`Read them from configuration at boot rather than compiling them into the binary, so an operator can change them without shipping a build. Say the trade-off honestly: configuration becomes a production surface that now needs its own review and audit, which constants in code didn't need.`,
      follow:`Who should be allowed to change that configuration, and how would you prevent an accidental change from taking down live matches?`,
      red:`Hardcodes capacity limits and treats every adjustment as requiring a full release.` }
  ],
  senior:[
    { q:`A live game is hitting a capacity ceiling during peak hours. Walk me through how you'd diagnose whether it's the request tier, the session tier, or the pub/sub layer.`,
      a:`Separate the three by what they actually cost: measure concurrent sessions per instance versus request throughput versus fan-out volume independently, because they scale differently and a fix aimed at the wrong one wastes the outage. Say what a load test has to simulate to reveal the real ceiling: concurrent sessions, not requests per second. Name which of the three is usually cheapest to fix and why.`,
      follow:`The session tier is fine but a single pub/sub channel is saturating one node. What's the actual fix, and what does it cost?`,
      red:`Proposes scaling everything uniformly without first isolating which tier is actually the bottleneck.` },
    { q:`You're asked to partition a live game's population into shards to unlock more capacity. What do you push back on before agreeing to build it?`,
      a:`Say plainly that this changes what the game is for players who end up separated, and that decision belongs to product, not infrastructure. Push for naming which features must still work across partitions, like friends lists or leaderboards, before any code is written, because those either get built specially or get given up, and both are real costs. Describe how you'd choose a partitioning key that avoids hot spots.`,
      follow:`Product wants cross-partition friends lists after all. What does that actually require, on top of the partitioning you already built?`,
      red:`Agrees to partition immediately as a purely technical task with no product conversation.` }
  ] });

T('server-anticheat',{ d:'server', t:'Anti-cheat and abuse handling', tag:'The client is the attacker. Detect, keep the evidence, and decide the response separately from the detection.',
  what:`Everything that stops a player from gaining an unfair advantage or making the game worse for others. It splits into prevention, which is the authority model refusing to accept an assertion, detection, which is re-simulating or bounding what the client claims, evidence, which is the replay and aggregate data that lets a human judge, and response, which is the ladder from a rejected request through rate limits to a shadow ban. Abuse of other players sits in the same system with different signals.`,
  why:[`Anything the client decides, the client can lie about. The only question is whether you find out.`,`Cheating is a retention problem before it is a fairness problem. Honest players leave quietly.`,`Detection without retained evidence produces bans you cannot justify and cannot appeal, which is worse than no bans.`,`The response has to be decided by policy and people, not by a threshold in code that nobody owns.`],
  think:{ q:[`For each thing the client sends, what is the best possible outcome a cheater could claim, and does the server check it?`,`What is the physically possible range for this value, and is that bound written anywhere?`,`When detection fires, what do we keep so a human can review it a week later?`,`What do we do on the first detection, and is that the same as the tenth?`,`Which abuse is against the rules and which is merely someone playing in a way we did not expect?`],
    trade:[`Blocking immediately stops the cheat and teaches the cheater exactly which check caught them. Delayed and batched enforcement hides the detection and lets them keep an advantage in the meantime.`,`Client-side integrity measures raise the cost of casual cheating and can never be trusted by the server, and they add a permanent build and support burden.`,`Aggressive thresholds catch more and produce false positives that punish honest players, which costs more trust than the cheating did.`],
    traps:[`Validating a submitted result against a formula the client also computed. You have checked your own arithmetic, not their honesty.`,`Simulating an unbounded input. A client that submits a million ticks of input is a denial of service dressed as a score.`,`Obfuscating the build without excluding the network-serialised types. Anything a framework resolves by name at runtime breaks when the name changes, and it breaks on device while the editor still works.`,`Deleting evidence on a schedule shorter than the time it takes anyone to notice a cheat.`,`Treating a statistical outlier as proof. The best honest player in the world looks exactly like a mild cheat.`],
    good:[`Every rejected submission is logged with its inputs, so a pattern is visible without asking for more data later.`,`There is a written ladder of responses and a person who owns the decision to move up it.`],
    bad:[`The first anyone hears of a cheat is a video of it.`,`A detection threshold was tuned once and nobody knows what it currently catches.`] },
  how:[`Start from the authority table. Everything the client decides is a detection problem, and the cheapest anti-cheat is moving a decision to the server.`,`Bound every input before you spend work on it: length, range, rate, and how far in the past a timestamp can be. Reject outside the bound before simulating.`,`Where the client simulates, re-simulate on the server from the seed and inputs, and accept only an exact match.`,`Keep the evidence: the submission, the inputs, the claimed result, the computed result, and the player. Retain it long enough for a human to act, and say how long.`,`Aggregate over time rather than judging single events. Win streaks, submission rates and impossible-improvement curves are more reliable than any one match.`,`Separate detection from response. Detection writes a record. A policy, owned by a person, decides between ignoring, rejecting, rate limiting, shadow banning and removing.`,`Prefer responses that do not announce themselves. A shadow ban that matches cheaters with cheaters buys time that an instant rejection does not.`,`Sweep for the shapes that cheating leaves behind: submissions that never completed, sessions that ended without a result, results arriving for matches that already closed.`],
  ai:{ yes:[`Enumerate what a malicious client could claim from a described message set, ordered by how much advantage each one buys.`,`Propose bounds for each input field and name the ones that have no physical limit and therefore need a different check.`,`Design the evidence record: what to keep, what to hash, what never to store, and how long to retain it.`,`Draft aggregation queries that surface implausible improvement, impossible rates and submissions with no matching session.`],
       no:[`Decide who gets banned. That is a policy judgement with an appeal path and a person who owns it.`,`Set thresholds from intuition. Thresholds come from the distribution of your honest players.`,`Promise that a client-side measure is secure. Nothing running on the player's machine is.`] },
  prompts:[{l:'Threat pass',p:`Here are the messages our client can send and the fields in each: [MESSAGES]. Acting as an attacker with full control of the client, list what you would claim for each message, ordered by advantage gained. For each, state the server-side check that would catch it, and mark the ones where no server-side check is possible without changing who decides the outcome.`},
    {l:'Evidence and ladder',p:`Our detection is [MECHANISM] and it fires on [SIGNAL]. Design the evidence record a human reviewer would need a week later, the retention period and the reason for it, and a response ladder from first detection to removal. For each rung say what the player experiences, what it teaches a cheater about our detection, and who owns the decision to apply it.`}],
  verify:[`Is every input bounded before any work is done on it, including the ones that look harmless?`,`Does the evidence record contain enough for a reviewer who was not there, and does it avoid storing anything it should not?`,`Are the current thresholds derived from the honest-player distribution, and when were they last checked against it?`],
  test:[`Write a client that submits impossible values on every field and measure which ones the server accepts. Any acceptance is a finding, not a test failure.`,`Measure the false positive rate of each detection against a known-honest cohort before turning any enforcement on.`,`Measure how long evidence is retained against how long it actually takes the team to notice and review a new cheat. If retention is shorter, it is not evidence.`],
  rel:[['ethics-and-responsibility','Bans, shadow bans and retained evidence are decisions about people, with the same duty of care as any other data practice.'],['readable-and-fair-ai','Fairness the player can verify is the same problem on the design side. A loss they cannot explain reads as cheating whether or not it was.'],['server-determinism','Re-simulation is the strongest detection available, and it collapses the moment parity is not proven.'],['server-authority','Moving a decision to the authority prevents a whole class of cheating that no detector would have to catch.'],['backend-observability','Action logs, aggregates and retained replays are observability infrastructure being used as evidence.']],
  tech:[
    {n:'Server re-simulation', how:`The server re-runs the submitted run from the seed and inputs and compares its own result with the claim, accepting only an exact match.`, fit:`Any content where the client simulates and the result matters: runs, races, time trials, solo challenges.`, cost:`Requires proven determinism and server time proportional to the run. Inputs must be bounded or the check is a denial of service.`, alt:`Plausibility bounds on the result alone, far cheaper and only catches the obvious.`},
    {n:'Bounds and rate gates', how:`Every field has a physically possible range and every action a maximum rate. Violations are rejected before any work happens.`, fit:`The first line everywhere, including on messages you do not think are worth protecting.`, cost:`Bounds drift out of date as the game is balanced, so they need an owner and a test.`, alt:`Checking after the fact in aggregates, which catches it later and lets the cheat land first.`},
    {n:'Aggregate and outlier detection', how:`Batch jobs look across time for shapes a single event cannot show: improvement curves, win streaks, submission frequency, results without a matching session.`, fit:`Catching sophisticated cheating and abuse that is legal per message and illegitimate in pattern.`, cost:`Produces suspicion, never proof. Needs a human decision layer and a false positive budget.`, alt:`Per-event rules, which are certain and only see what one message contains.`},
    {n:'Shadow enforcement', how:`A detected account keeps playing with its effects contained: results discarded, matched only with similar accounts, leaderboard entries hidden from everyone else.`, fit:`Buying time to observe a new cheat, and reducing the speed at which cheaters iterate against your detection.`, cost:`Runs a second class of service you must keep working. A false positive is invisible to the player and therefore never appealed.`, alt:`Immediate rejection, which is honest, appealable, and tells the cheater exactly what you detect.`}
  ] });
ENGINE('server-anticheat',{
  godot:{ term:`On the client side the useful work is refusing to be the authority. Every gameplay RPC entry point is an untrusted boundary, and the sender id is the only identity you may believe.`,
    api:['MultiplayerAPI.get_remote_sender_id()','@rpc("any_peer", "call_remote", "reliable")','SceneMultiplayer.auth_callback / auth_timeout','PackedByteArray size checks before decoding','Crypto.hmac_digest() for submission signing','OS.has_feature("debug") to keep debug paths out of release'],
    snippet:`@rpc("any_peer", "call_remote", "reliable")
func submit_run(seed: int, inputs: PackedByteArray, claimed: int) -> void:
\tif not multiplayer.is_server(): return
\tvar who := multiplayer.get_remote_sender_id()
\tif inputs.size() > MAX_INPUT_BYTES: return          # bound before you simulate
\tvar actual: int = Sim.new().run(seed, inputs).hash()
\tif actual != claimed:
\t\tReplays.keep(who, seed, inputs, claimed, actual) # evidence, not a ban
\t\treturn
\tScores.commit(who, actual)`,
    pitfall:`Shipping the debug and cheat helpers that made development bearable. A Godot export includes every script in the project, so a console command that grants currency is in the release build whether or not any UI reaches it. Gate them behind OS.has_feature("debug") at the definition, not at the call site, and check an export build for what is still reachable.`,
    map:`Godot's get_remote_sender_id() is Unity's ServerRpcParams.Receive.SenderClientId, and both are the only identity in the message you are allowed to trust.` },
  unity:{ term:`The client side is ownership discipline plus build hygiene. ServerRpc with required ownership fixes who may call, the sender id fixes who called, and the obfuscation configuration decides whether the netcode still works on device.`,
    api:['[ServerRpc(RequireOwnership = true)]','ServerRpcParams.Receive.SenderClientId','[DoNotObfuscateClass] on weaved network types','Conditional("UNITY_EDITOR") on debug helpers','NetworkManager.DisconnectClient(clientId)','Application.genuineCheckAvailable'],
    snippet:`[DoNotObfuscateClass]                        // the weaver resolves members by name
public class RunSubmit : NetworkBehaviour {

    [ServerRpc(RequireOwnership = true)]
    void SubmitServerRpc(int seed, byte[] inputs, long claimed,
                         ServerRpcParams p = default) {
        if (inputs.Length > MaxInputBytes) return;      // bound before simulating
        long actual = Sim.Hash(Sim.Run(seed, inputs));
        ulong who = p.Receive.SenderClientId;
        if (actual != claimed) { Replays.Keep(who, seed, inputs, claimed, actual); return; }
        Scores.Commit(who, actual);
    }
}`,
    pitfall:`Turning on name obfuscation without excluding the network types. Netcode weavers and serialisers resolve members by name at runtime, so renaming them breaks remote player registration on a device build while the editor, which does not obfuscate, keeps working. The bug looks like a network fault and is a build configuration fault. Mark the weaved classes excluded and put a device smoke test in the pipeline.`,
    map:`Unity's [ServerRpc(RequireOwnership = true)] is Godot's @rpc("any_peer") plus an explicit is_server() and sender check.` },
  note:`Nothing on this tab is anti-cheat. It is the client not making the server's job impossible: one trusted identity per message, bounded payloads, no debug affordances in the release build, and a build configuration that does not quietly break the netcode. Detection, evidence and enforcement all live on the server.` });
INTERVIEW('server-anticheat',{
  junior:[
    { q:`Why can't you trust a result the client computed, even if the client used the exact formula the server would use?`,
      a:`Checking a submitted result against a formula the client also computed only verifies your own arithmetic against itself, it says nothing about whether the client actually ran the play it claims to have run. Give the concrete fix: re-simulate independently from the seed and inputs, or bound the value against what's physically possible.`,
      follow:`What would make you confident a value really is physically bounded rather than just usually bounded?`,
      red:`Believes validating a result against a client-supplied formula is sufficient anti-cheat.` },
    { q:`What's the difference between preventing a cheat and detecting one?`,
      a:`Prevention is the authority model refusing to accept an assertion in the first place, so the cheat is structurally impossible. Detection is noticing after the fact that a claim doesn't hold up, which means the player experienced some advantage in the meantime, however briefly. Say which is cheaper when it's available.`,
      follow:`Give an example of something that can only be detected, never prevented, and why.`,
      red:`Uses "prevention" and "detection" interchangeably.` },
    { q:`Why does a detection system need to keep evidence, not just log that something suspicious happened?`,
      a:`A ban without retained evidence can't be justified or appealed, which is worse than not banning at all, because it costs trust with a possibly innocent player. Say what belongs in the record: the submission, the inputs, the claimed result, the computed result, and the player, retained long enough for a human to actually review it.`,
      follow:`How long should that evidence be kept, and what decides the answer?`,
      red:`Treats a log line saying "flagged as suspicious" as sufficient evidence for a ban.` }
  ],
  mid:[
    { q:`Design the input validation for a message where a client submits a match result. What do you check, and in what order?`,
      a:`Bound every field first, length, range, rate, how far in the past a timestamp can be, and reject outside the bound before spending any work on it. Then, if the client simulated the play, re-simulate on the server from the seed and inputs and accept only an exact match. Say why order matters: an unbounded input handed straight to simulation is a denial-of-service dressed as a cheat check.`,
      follow:`A field has no natural physical limit, like a currency amount in an unbounded economy. How do you check it instead?`,
      red:`Re-simulates or deeply processes a submission before doing any cheap bounds checking on it.` },
    { q:`You detect a likely cheater. What actually decides whether they get banned immediately, rate limited, or shadow banned?`,
      a:`Say plainly that this is a policy decision owned by a person, not a threshold that fires an automatic action, because the response teaches the cheater something about your detection every time it's visible. Describe the trade-off: immediate rejection is honest and appealable but reveals exactly what you caught; shadow enforcement buys time to observe but risks an invisible, unappealable false positive.`,
      follow:`How would a falsely flagged honest player ever find out and get it reversed under shadow enforcement?`,
      red:`Automates the ban decision directly off a single detection signal with no human review step.` },
    { q:`How would you set the threshold for flagging an outlier, like an implausible improvement curve?`,
      a:`From the actual distribution of your honest player base, not from intuition, because the best honest player in the world can look statistically identical to a mild cheat. Say how you'd validate a proposed threshold: measure its false positive rate against a known-honest cohort before turning on any enforcement tied to it.`,
      follow:`Your honest player distribution shifts after a balance patch. What does that do to a threshold you set six months ago?`,
      red:`Sets a threshold once from a gut feeling and never revisits it against real player data.` }
  ],
  senior:[
    { q:`You're told the game has almost no active cheating reports. Is that reassuring? What do you check?`,
      a:`No, treat it skeptically: it could mean detection genuinely works, or it could mean nobody's looking and the first anyone will hear of a cheat is a video of it. Check whether there's active monitoring producing a denominator, not just a numerator of reports, and whether any bounds or re-simulation checks actually exist on the highest-value actions. Say what you'd instrument first.`,
      follow:`You find bounds exist but haven't been updated since a major balance patch six months ago. What does that risk?`,
      red:`Accepts a low report count at face value as proof the game is clean.` },
    { q:`Design the anti-cheat approach for a new competitive mode from scratch, end to end.`,
      a:`Start from the authority table: everything the client currently decides is a detection problem, and the cheapest anti-cheat is moving that decision to the server first. Bound every remaining input. Where the client simulates, re-simulate and accept only exact matches, which requires proven determinism as a precondition. Build the evidence record and retention policy before enabling any enforcement, and separate detection, which writes a record, from response, which is a policy decision. Name the order you'd build these in and why that order.`,
      follow:`Server re-simulation for this mode requires proven determinism, and the simulation isn't deterministic yet. What does that do to your plan?`,
      red:`Proposes enforcement mechanisms before the detection and evidence layers actually exist.` }
  ] });

T('server-liveops',{ d:'server', t:'Live operations on the server', tag:'The game keeps running while you change it. Gates, versions and scheduled jobs are how you stay in control.',
  what:`The server-side machinery that lets a live game be changed without breaking the players inside it. A maintenance gate that can close the game before a risky change, a client-version gate that can force an update while still letting a few endpoints answer, versioned master data that clients download rather than ship, scheduled batch jobs that do the work no request can do, and an order of operations for releases that keeps data, server and client compatible at every moment in between.`,
  why:[`A live game has no maintenance window you did not create, so the gate has to be a feature, not an emergency.`,`Clients update slowly and unevenly. The server will be talking to several versions of the game at once whether or not you planned for it.`,`Balance that ships as data instead of as a build turns a week-long release into a same-day change.`,`Batch jobs are where seasons end, rewards are granted and stale state is swept, and a batch that silently fails is discovered by players.`],
  think:{ q:[`Which endpoints must keep working while the game is closed for maintenance, and why exactly those?`,`What is the oldest client version we will still serve, and what does an older one see?`,`Does this change need a new client, or can it ship as data to the clients already installed?`,`In what order do the data change, the server release and the client release have to land, and is every intermediate state valid?`,`If this batch does not run tonight, who notices, and how?`],
    trade:[`Forcing an update guarantees one client version and locks out everyone who cannot update right now.`,`Data-driven content ships fast and lets anyone change the game without review, which is the same sentence.`,`A full maintenance window is the safest way to make a risky change and it is also the most visible failure a live game can show.`],
    traps:[`Putting the version check after the handler that needs it, so the endpoint that tells the client to update is itself blocked.`,`Shipping master data that references content the installed client does not have. The data version and the client version are one compatibility question.`,`Writing a batch with no record of whether it ran, so a missed night is invisible until the numbers are wrong.`,`A deploy order that requires the client and server to land simultaneously. There is no simultaneous.`,`Testing maintenance mode only by enabling it, never by having a player in a session when it turns on.`],
    good:[`Maintenance and force-update can be switched on from configuration, and someone has practised it.`,`Every batch job has a documented schedule, a record of its last successful run, and a stated recovery if it is missed.`],
    bad:[`Changing a drop rate requires a client release.`,`The team has never seen what an out-of-date client does.`] },
  how:[`Put the maintenance gate and the version gate in the request path before anything else, with an explicit allow list of paths that must still answer, and keep that list short and reviewed.`,`Carry the client version, the master data version and the resource version on every request so the server always knows what it is talking to.`,`Ship balance and content as versioned master data the client downloads at boot, and validate it against the client versions that will receive it before publishing.`,`Define the release order once and always follow it: data that is backward compatible first, server second, client last. Every intermediate state must be a state the live game can sit in.`,`Give every batch a header that states its schedule, whether it is scheduled or manual recovery only, and what happens if it is skipped. Record each run and alert on a missed one.`,`Make batches idempotent and re-runnable, because the day you need to re-run one is the day it already half finished.`,`Keep a rollback for each part. Data can be republished at the previous version, the server can be redeployed, the client cannot be recalled.`,`Practise the whole procedure on a non-live environment, including closing the game with players inside it.`],
  ai:{ yes:[`Draft the release order for a change that touches data, server and client, and list what breaks in each intermediate state.`,`Review a maintenance gate's allow list for endpoints that would leave a client stuck.`,`Write the batch header block: schedule, trigger, idempotency, what a skipped run costs, how to recover it.`,`Generate a compatibility matrix of client versions against master data versions from a described change.`],
       no:[`Decide to close the game. That is an operational and business call with a cost per minute.`,`Choose the minimum supported client version. It locks out real players.`,`Judge whether a data change is safe for installed clients without seeing what those clients do with it.`] },
  prompts:[{l:'Release order',p:`We are shipping a change that touches [DATA CHANGE], [SERVER CHANGE] and [CLIENT CHANGE]. Produce the ordered release plan and, for every intermediate state between steps, say which combination of versions is live and whether the game still works for a player sitting in it. Mark any step that cannot be rolled back and propose how to make it reversible.`},
    {l:'Batch job spec',p:`This job does [WHAT] and is expected to run [SCHEDULE]. Write its header block: exact schedule, whether it is scheduled or manual recovery only, what it reads and writes, why it is safe to run twice, what happens if it is skipped for one cycle and for a week, and the alert that should fire if it does not complete. Then list the failure modes that would leave data half written.`}],
  verify:[`Is the maintenance allow list short, reviewed, and does it include the path that tells a client to update?`,`Does every batch record its last successful run somewhere a person can see?`,`Has the release order been followed in a rehearsal, with a player in a session when the gate closed?`],
  test:[`Enable maintenance mode with live sessions running in a test environment. Measure what those players see, whether the client recovers on retry, and how long the whole close takes.`,`Run the previous client build against the current server. Measure exactly what the player is shown, and whether they can reach the update prompt.`,`Skip a batch deliberately in a test environment and measure how long it takes for anything to alert. If nothing alerts, the job is unmonitored.`],
  rel:[['live-operations','This is the server half of the live-operations plan, and the two are the same calendar.'],['metrics-and-success','A live change is only a change if you can see its effect, which means the measurement exists before the release.'],['server-scaling','Deploys, drains and capacity are the operations the gates are protecting.'],['backend-migrations-config','Schema migrations and environment configuration are the other half of the release order.'],['pm-liveops-cadence','The cadence decides how often this machinery runs, and machinery that runs rarely is machinery nobody trusts.']] });
ENGINE('server-liveops',{
  godot:{ term:`The boot sequence is the client's live-operations surface. Before any gameplay scene loads, one call decides whether the game is open, whether this build may still play, and which master data version to fetch.`,
    api:['HTTPRequest.request() at boot, before change_scene_to_file()','ProjectSettings.get_setting("application/config/version")','SceneTree.change_scene_to_file()','ResourceLoader.load_threaded_request() for downloaded data','FileAccess / user:// for the cached master payload','OS.shell_open() for the store page'],
    snippet:`func _on_boot_response(body: Dictionary) -> void:
\tif body.min_client_version > APP_VERSION:
\t\tUi.force_update(body.store_url)         # no path past this screen
\t\treturn
\tif body.maintenance_until > 0:
\t\tUi.maintenance(body.message, body.maintenance_until)
\t\treturn
\tif body.master_version != Master.loaded_version:
\t\tawait Master.download(body.master_version)   # data first, scene second
\tget_tree().change_scene_to_file("res://scenes/home.tscn")`,
    pitfall:`Loading the home scene first and checking the gates afterwards, because the boot call is asynchronous and the scene change is not. The player reaches a screen built from stale master data, then gets thrown out of it, and any request they fired in between is already rejected. Gate before the first scene change, and keep the boot scene able to display maintenance and update messages on its own.`,
    map:`Godot's boot HTTPRequest before change_scene_to_file is Unity's boot await before SceneManager.LoadScene, and Master.download is Addressables.UpdateCatalogs.` },
  unity:{ term:`A boot scene runs the gate call, then the content catalog check, then loads the first real scene. Version comes from the build, catalog state from the remote content system.`,
    api:['UnityWebRequest at boot','Application.version','Addressables.UpdateCatalogs() / CheckForCatalogUpdates()','Addressables.LoadContentCatalogAsync()','SceneManager.LoadSceneAsync()','Application.OpenURL() for the store page'],
    snippet:`async Task Boot() {
    var gate = await Api.Post<BootResponse>("/boot");
    if (gate.MinClientVersion > Application.version) { Ui.ForceUpdate(gate.StoreUrl); return; }
    if (gate.MaintenanceUntil > 0) { Ui.Maintenance(gate.Message, gate.MaintenanceUntil); return; }

    if (gate.CatalogHash != PlayerPrefs.GetString("catalog")) {
        var check = Addressables.CheckForCatalogUpdates(false);
        await check.Task;
        if (check.Result.Count > 0) await Addressables.UpdateCatalogs(check.Result, false).Task;
        PlayerPrefs.SetString("catalog", gate.CatalogHash);   // only after it succeeded
    }
    await SceneManager.LoadSceneAsync("Home");
}`,
    pitfall:`Writing the new catalog hash to preferences before the catalog update has actually completed. An interrupted download then leaves the client believing it holds content it never fetched, and every missing address fails at the point of use, far from the cause. Record the version only after the update succeeds, and make a failed update fall back to the previous catalog rather than to an empty one.`,
    map:`Unity's Addressables catalog version is the master data version in Godot, and Application.version is the client version the server gates on.` },
  note:`Live operations happens on the server and is felt at the client's boot sequence. The contract is small and rigid: send the client version and the data version on every request, obey the gates before touching content, and never advance a stored version number until the thing it describes is really on disk.` });
INTERVIEW('server-liveops',{
  junior:[
    { q:`Why does a live game need a maintenance gate as a designed feature, instead of just being able to take the servers down when needed?`,
      a:`Say plainly that a live game has no maintenance window that wasn't deliberately built, so without a gate, "taking the servers down" means an uncontrolled failure players experience as a crash. A real gate lets you close the game in a controlled way, show a message, and decide exactly which endpoints, like the update prompt, still answer.`,
      follow:`What's the one endpoint that must never be blocked by the maintenance gate, and why?`,
      red:`Assumes maintenance can be handled ad hoc without a dedicated gate mechanism.` },
    { q:`Why will a live server end up talking to several different client versions at once, whether or not that was planned?`,
      a:`Clients update slowly and unevenly, some players disable auto-update, some are offline for weeks, so the server has to be designed for multiple versions coexisting rather than assuming everyone updates on release day. Say the consequence: any breaking change needs a plan for what an old client sees.`,
      follow:`What should the server do with a client version it no longer wants to support at all?`,
      red:`Assumes all players update immediately after a release ships.` },
    { q:`Why does shipping balance changes as downloadable data instead of a client build change the pace of the game?`,
      a:`Data the client downloads at boot can change same-day, without an app store review cycle, while a build change is a multi-day process at best. Say the trade-off honestly: it also means anyone with access to publish that data can change the game, so it needs its own review process even without a code release.`,
      follow:`Who should be allowed to publish that data, and what would you require before they can?`,
      red:`Treats data-driven content as risk-free just because it skips the build pipeline.` }
  ],
  mid:[
    { q:`You're shipping a change that touches the database schema, the server, and the client. What order do you release them in, and why?`,
      a:`Backward-compatible data change first, server second, client last, because every intermediate combination of versions has to remain a state the live game can actually sit in for however long that rollout takes. Say what you'd check at each step: does the old client still work against the new server, does the new server still work against the old data shape.`,
      follow:`The client change can't be made backward compatible with the current server. What does that force you to do differently?`,
      red:`Plans to deploy data, server and client "at the same time" without acknowledging there's no such thing as simultaneous.` },
    { q:`A nightly batch job that grants rewards silently failed last night. How should the team have found out before players did?`,
      a:`Say what should already exist: every batch records its last successful run somewhere visible, and a missed run triggers an alert rather than a silent gap. Describe the fix for this incident and the process fix: add the missing monitoring, and make the job idempotent and re-runnable so recovering from a missed night doesn't risk double-granting rewards.`,
      follow:`Why does idempotency matter specifically for the recovery, not just for the normal run?`,
      red:`Proposes just re-running the job manually without addressing why nothing alerted in the first place.` },
    { q:`How would you test that your maintenance mode actually works before you need it for a real risky change?`,
      a:`Enable it in a test environment with real live sessions running, not an empty one, and measure exactly what those players see, whether they can still reach the update or maintenance screen, and how long the full close takes. Say why testing only by flipping the switch with nobody connected misses the actual failure mode.`,
      follow:`A player is mid-transaction when maintenance mode engages in your test. What happens to that transaction?`,
      red:`Has only ever tested maintenance mode with no players connected.` }
  ],
  senior:[
    { q:`Your team wants to move faster on live balance changes. What would you actually change, and what would you refuse to change?`,
      a:`Push toward versioned master data the client already knows how to fetch, validated against the client versions that will receive it before publishing, so most changes skip the build pipeline entirely. Refuse to skip the compatibility check between data version and client version just to move faster, because that's the exact gap that ships broken references to content an installed client doesn't have.`,
      follow:`How would you validate a new data version against every client version still in the field before publishing it?`,
      red:`Proposes removing the data-to-client compatibility check as the way to increase release velocity.` },
    { q:`Design the release rehearsal process for a live game before a major version bump that touches data, server, and client.`,
      a:`Run the full ordered release in a non-live environment with real, connected sessions, including deliberately closing the game with players inside it and confirming the maintenance and version gates behave as designed at every intermediate state. Include the rollback path for each layer, and be explicit that the client can't be recalled once it's out, which constrains what "rollback" even means for that layer.`,
      follow:`The rehearsal reveals a state between server and client where the game genuinely doesn't work correctly. What do you do with the release?`,
      red:`Treats rehearsal as a formality and ships without ever exercising an intermediate state with real players connected.` }
  ] });
