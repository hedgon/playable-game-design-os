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
     server-stack-choices      Choosing a stack: netcode, hosting, backend services, lock-in
   ===================================================================== */
DOMAINS.push({ id:'server', lens:'eng', t:'Game Server', short:'Authority, determinism, sync, realtime, matchmaking, scaling, live ops', color:'var(--d-server)',
  sum:`The authoritative copy of the game. Where the backend answers questions, the game server decides what is true: who hit whom, what the world looks like this tick, and whether a client is allowed to say what it just said. Every choice here is a trade between responsiveness, fairness and cost.`,
  links:[['backend','The server shares the same layering, storage and observability as the service. It adds a clock.'],['core','Latency, prediction and rollback are the core loop as the player physically meets it over a network.'],['systems','Anything the economy or progression owns must be resolved by the authority, or it is a suggestion.'],['gameai','Server-side behaviour, directors and bots run inside the authoritative simulation, not beside it.'],['infra','Rooms, shards and fan-out are deployment shapes before they are code.']],
  titles:{ test:'What should I test or measure?' } });

T('server-authority',{ d:'server', t:'Authority models', tag:'Someone has to be right. Decide who, then design the wait the player feels while the truth arrives.',
  what:`Who owns the true state of the match. The four working answers are a server tick loop that simulates everything, host mode where one player’s machine is the server, client-simulate-server-verify where the client resolves play and the server re-runs it to confirm, and lockstep where every peer runs the same simulation on shared inputs. The model decides what a client is allowed to assert, what it may only request, and what happens when the two disagree.`,
  why:[`Every anti-cheat, sync and fairness decision downstream is already fixed by this choice. Picking it late means rewriting the netcode.`,`It sets the latency the player feels. A server tick loop adds a round trip to every action unless you predict. Host mode gives the host zero latency and everyone else a permanent handicap.`,`It sets the cost. A tick loop per match is a running process per match. Verification after the fact is a request like any other.`,`It decides what is recoverable. If the client is the only place the match ever existed, a crash loses it.`],
  think:{ q:[`What is the smallest fact a cheater could fake that would ruin the game for someone else?`,`Does this game need to resolve interactions between players in real time, or only compare results afterwards?`,`How many concurrent matches will exist, and can I afford a process per match?`,`If the host leaves, what happens to the other nine players, and have I decided that on purpose?`,`Which actions can the client show immediately and correct later, and which must never be shown until confirmed?`],
    trade:[`Full server authority is fair and costs a round trip plus a running simulation per match. Host mode is cheap and responsive for one player and unfair to the rest.`,`Client-simulate-server-verify gives instant local play and detects cheating after the fact, but it cannot stop a player from experiencing a fake outcome for the seconds before the server disagrees.`],
    traps:[`Choosing host mode for the prototype and discovering at beta that the ranked mode needs authority the architecture cannot provide.`,`Trusting a value because the client computed it from values the server sent. The client can still lie about the result.`,`Letting the host’s local simulation run one frame ahead of the message it sends, so the host sees hits nobody else can see.`,`Assuming an authoritative server implies lag compensation. Lag compensation is a separate decision with its own fairness cost.`,`Making the server authoritative for cosmetics and chat, where it buys nothing and costs bandwidth.`],
    good:[`You can state, for one named action, exactly which machine decides it and what the other machines do while they wait.`,`A design change to an action starts with the question of who resolves it.`],
    bad:[`The answer to “can the client cheat this” is “the client would not do that”.`,`Two systems in the same game disagree about who is authoritative and nobody noticed until a desync bug.`] },
  how:[`Write the authority table before any netcode. One row per player-visible action, three columns: who decides, what the client may show before the decision, what the correction looks like when they differ.`,`Pick the model from that table, not from a framework tutorial. If no row needs real-time cross-player resolution, you do not need a tick loop.`,`Make the client’s messages requests, never assertions. A client sends an intent and an input, the authority sends the outcome.`,`Give every correction a visible, designed form. A rubber band, a rewind, a refusal message. An unexplained snap reads as a bug.`,`In host mode, write down what the non-host players lose and compensate it in design rather than pretending it is symmetric.`,`Decide the host-leaves policy explicitly: migration, forfeit, or session death. Implement the one you chose and test it.`,`Keep the authority check at one chokepoint per action so an added feature cannot skip it.`,`Worked example, lag compensation for a hitscan shot (illustrative numbers, not defaults). The shooter has 50 ms one-way latency and renders other players 100 ms in the past (the interpolation delay). The shooter fires at server time 9.950 s, and the shot arrives when the server clock reads 10.000 s. The screen the shooter aimed at showed the target as it was at 9.950 - 0.100 = 9.850 s (equivalently 10.000 - 0.050 - 0.100), so the server (1) rewinds the target’s hit boxes to their stored position at 9.850 s, (2) casts the shot’s ray against those old boxes, (3) restores the boxes to now, and (4) applies the damage at 10.000 s. The server keeps about a second of recent hit box history per player and clamps the rewind (for example to 200 ms), so a player with a bad connection cannot shoot around corners into the past.`,`Say the fairness cost out loud in the design. In this example the target is shown 150 ms behind (50 ms latency plus 100 ms interpolation delay), so they can be hit up to about 150 ms after they reached cover. Lag compensation trades a small unfairness to the target for a fair shot to the shooter. Projectiles and abilities that are slow or visible in flight are often not compensated at all.`],
  ai:{ yes:[`Draft the authority table from a list of player actions and mark which ones are exploitable if the client decides them.`,`Enumerate the failure cases of a stated model, such as host disconnect, duplicate submission, or a client that simulates faster than real time.`,`Turn a described model into a sequence diagram of one action across client, host and server so gaps become visible.`,`Compare two authority models against a stated concurrency and budget, listing what each costs per match.`],
       no:[`Choose the model. It is a product and cost commitment, not a technical preference.`,`Assert that a given check is sufficient against cheating. It will name plausible checks without knowing your client.`,`Write the correction feel. What a rewind should look like is a design question about the player’s trust.`] },
  prompts:[{l:'Authority table',p:`Here is the list of actions a player can take in our match: [LIST]. Our proposed model is [MODEL]. For each action, fill three columns: which machine decides the outcome, what the acting client may legitimately display before that decision arrives, and what the visible correction is when the two differ. Mark every action where the client deciding would let someone gain an unfair advantage, and say what the cheat would look like.`},
    {l:'Model comparison',p:`We expect [N] concurrent matches of [PLAYERS] players, sessions of [LENGTH], on [PLATFORMS]. Compare server tick authority, host mode, and client-simulate-server-verify for this shape. For each: the latency the player feels on a named action, what a cheating client can achieve, the per-match running cost, and the failure mode when a player’s connection drops. Do not recommend one until the end, and state the assumption that would flip your answer.`}],
  verify:[`Does every row of the authority table name a machine, or do some say “both”?`,`For each action the client displays early, is there a written correction behaviour, and has someone seen it fire?`,`Did the model get chosen against our concurrency and budget, or copied from a sample project?`],
  test:[`Play a match with 200 ms of artificial latency added to one client and have that player describe what felt wrong. Corrections you cannot explain to them are corrections you have not designed.`,`Run a client that submits a deliberately impossible outcome. Measure whether the authority rejects it, how long the faker saw the fake result, and whether anyone else ever saw it.`,`Kill the host mid-match. Measure what the other players see, how long they see it, and whether the session ends cleanly or leaves a zombie room.`],
  facts:[{claim:`Server-side lag compensation reconstructs the world at the time the shooter fired, using timestamped inputs, and evaluates the shot against it. Gambetta notes the cost: a target can take damage a fraction of a second after they thought they were safe behind cover.`,asOf:'2026-09-30',src:'https://www.gabrielgambetta.com/lag-compensation.html'}],
  rel:[['core-loop','Authority decides how long the loop waits before a consequence is true, which is the loop the player feels.'],['server-rollback-netcode','Rollback is the peer-to-peer answer to the same wait: every peer simulates, and corrections replay the past.'],['game-feel-and-juice','Prediction and correction are felt as feel. A snap-back is a game feel problem before it is a netcode problem.'],['server-determinism','Client-simulate-server-verify is only possible if both sides compute the same answer from the same inputs.'],['server-state-sync','Once you know who decides, sync is the question of how that decision reaches everyone else.'],['server-anticheat','The authority model sets the ceiling on what cheating is even possible, before any detection is written.']],
  tech:[
    {n:'Server tick authority', how:`A server process runs the simulation at a fixed tick. Clients send inputs, the server advances state and broadcasts snapshots. Clients predict locally and reconcile against the authoritative snapshot.`, fit:`Competitive real-time games where players physically interact and fairness is the product.`, cost:`A running process per match, a prediction and reconciliation layer on the client, and a permanent latency budget to design around.`, alt:`If players never interact within the same instant, you do not need a tick loop at all.`},
    {n:'Host mode (one player is the server)', how:`One client starts as host and runs the authoritative simulation. Joiners connect to it. Sessions are found through a lobby or relay service so nobody needs a public address.`, fit:`Co-op and casual party games, small player counts, no ranking, no economy at stake.`, cost:`The host has zero latency and everyone else does not. The host can cheat freely. When the host leaves the match ends unless you build migration, which is its own project.`, alt:`A thin dedicated server for ranked modes while keeping host mode for casual play.`},
    {n:'Client simulates, server verifies', how:`The client runs the whole play locally and submits the seed plus the input trace. The server re-runs the identical simulation and accepts the result only if its own trace matches.`, fit:`Asynchronous or solo-run content, time trials, runs scored against a leaderboard. Anything where the result matters but the moment does not.`, cost:`Demands bit-exact parity between two runtimes and a golden-trace test that gates every change to either side. Detection is after the fact, never prevention.`, alt:`A plausibility check on the result alone is cheaper and catches only crude cheating.`},
    {n:'Deterministic lockstep', how:`Every peer runs the same simulation. Only inputs are exchanged, applied on an agreed tick with a small delay buffer.`, fit:`High unit counts where broadcasting state would be prohibitive, such as strategy games.`, cost:`One divergence desyncs everyone and is brutal to debug. Every peer waits for the slowest. Joining late means replaying the whole match.`, alt:`Snapshot sync with interest management, when unit counts are moderate.`}
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
    pitfall:`Marking a gameplay RPC @rpc(“any_peer”) and then forgetting the is_server() guard inside it. “any_peer” only says who may call, never who may decide, so any client can invoke the function on every other client directly and the authority never sees it. Pair every “any_peer” entry point with an explicit authority check and a get_remote_sender_id() lookup, and send the outcome back as a separate “authority” RPC.`,
    map:`Godot @rpc(“any_peer”) is Unity [ServerRpc], @rpc(“authority”) is [ClientRpc], and set_multiplayer_authority() is NetworkObject ownership.` },
  unity:{ term:`Authority is ownership on a NetworkObject. A NetworkBehaviour knows whether it is running on the server and whether it owns the object, and calls cross the boundary as ServerRpc upward and ClientRpc downward, or, from Netcode for GameObjects 1.8, through the single [Rpc(SendTo.Server)] style attribute newer samples use.`,
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
    map:`Unity [ServerRpc] is Godot @rpc(“any_peer”) plus an is_server() guard, [ClientRpc] is @rpc(“authority”), and IsOwner is is_multiplayer_authority().` },
  note:`Both engines give you the plumbing for an authority model and neither gives you the model. The decision that matters is the authority table: which machine resolves each named action, what the acting client may draw before the answer arrives, and what the correction looks like. Write that table before you pick an attribute.` });
INTERVIEW('server-authority',{
  junior:[
    { q:`What does it mean for a server to be authoritative, and can you give an example of something a client should never be trusted to say for itself?`,
      a:`Authority means one machine’s version of the truth wins. Give one concrete example: a client claiming it landed a hit, or claiming it has enough currency for a purchase. The server recomputes or checks that claim rather than accepting it. Say what the client is allowed to send instead: an intent, not a result.`,
      follow:`What would the client have to lie about to make that example matter in a competitive match?`,
      red:`Says the client “shouldn’t cheat” instead of naming what the server checks.` },
    { q:`What’s the practical difference between host mode and a dedicated server, from the player’s chair?`,
      a:`In host mode one player’s machine is also the server, so that player has zero network latency on their own actions and everyone else does not. A dedicated server treats every player identically but costs a round trip for everyone, including the host equivalent. Name a genre where host mode’s asymmetry is acceptable and one where it is not.`,
      follow:`If the host disconnects, what happens to the other players, and is that answer written down anywhere?`,
      red:`Describes the two as interchangeable “networking options” with no mention of who benefits.` },
    { q:`For a single action, like firing a weapon, what can the client show immediately, and what has to wait?`,
      a:`The client can play the local animation and sound the instant the button is pressed, because that is feedback about the player’s own input. Whether the shot hit is a fact about the world that the authority decides, and showing it early would be a guess dressed as a result. Give the concrete case where the guess and the real answer disagree.`,
      follow:`What should happen on screen in that disagreement, so it does not read as a bug?`,
      red:`Cannot separate “the input happened” from “the outcome is true”, and shows both at the same moment.` }
  ],
  mid:[
    { q:`Walk me through how you’d choose between server tick authority, host mode, and client-simulate-server-verify for a new project.`,
      a:`Start from concurrency and cost: can you afford a running process per match. Then latency: does the game need real-time cross-player resolution or only a scored result after the fact. A tick loop suits real-time fairness at a real cost, host mode suits small casual co-op, client-simulate-server-verify suits solo runs scored on a leaderboard. Name the row in an authority table that decided it for you.`,
      follow:`Your concurrency estimate turns out to be ten times too low six months in. What has to change?`,
      red:`Picks a model from a tutorial or a competitor’s marketing rather than from the game’s own action list.` },
    { q:`A player reports that a hit registered and then got reversed. How do you explain what happened, and how would you design the correction so it reads as intentional?`,
      a:`The client predicted or displayed an outcome before the authority confirmed it, and the authority disagreed. Say that this is expected under client-simulate-server-verify or predicted movement, not a bug by itself. Design the visible correction, a rewind, a rubber band, an effect, rather than an unexplained snap, and say what you’d measure to confirm players understand it.`,
      follow:`How far can that correction move the player before it stops being a correction and starts being a new problem?`,
      red:`Treats every correction as a netcode bug to be minimised rather than a designed player-facing moment.` },
    { q:`In a co-op match the host disconnects. What’s supposed to happen, and how was that decision made?`,
      a:`State the three real options: migrate the host, forfeit the match, or end the session. Say that this has to be decided and written down before launch, not discovered by a bug report, and that the answer depends on session length and stakes. Name what you’d implement for a short casual match versus a ranked one.`,
      follow:`What does the client show during the moment between the host leaving and the decided outcome taking effect?`,
      red:`Assumes host migration is “just a feature you add later” without pricing its engineering cost.` }
  ],
  senior:[
    { q:`You inherit a game where combat is server-authoritative but currency and inventory changes are trusted from the client. What’s your assessment, and what do you do first?`,
      a:`Name the risk directly: anything the client asserts about its own economy state can be forged, and that is worse than a combat exploit because it is silent and permanent. Do not propose a rewrite. Propose the authority table across the whole game, mark every action by who currently decides it, and prioritise moving the highest-value, hardest-to-detect gaps first. Say how you’d sequence that without freezing feature work.`,
      follow:`The currency system is deeply wired into UI code that assumes it can set the balance directly. How do you sequence the fix without a full rewrite?`,
      red:`Declares the whole system needs a ground-up rewrite before doing the risk-ranked audit.` },
    { q:`How do you build the authority table for a new multiplayer feature, and what’s the one thing you check before you sign off on it?`,
      a:`One row per player-visible action: who decides it, what the acting client may display before the decision, what the correction looks like when they differ. Build it before any netcode is written, from the actual action list, not from a framework’s examples. The one check before sign-off: for every row, ask what a cheating client could gain if that row’s answer were “the client decides”, and confirm the table forecloses it.`,
      follow:`Someone on the team wants to make the table looser “just for the prototype.” What’s your answer?`,
      red:`Signs off on a table with rows marked “both” or left blank, treating it as documentation rather than a design contract.` }
  ] });
DIAGRAM('server-authority', { kind:'matrix', title:'Who decides what is true, and what the player feels',
  rows:['Server authority','Host authority','Predict + verify','Lockstep'], cols:['Who decides','Cheat risk','Felt latency'],
  cells:[['The server simulates','Low','Needs prediction to hide it'],['One player’s machine','High for the host','None for the host'],['Client first, server confirms','Low if verified','Low, with corrections'],['Every peer, same inputs','Desyncs show it','Slowest peer sets the pace']] });

GO('server-authority', {
  api:['errors.New', 'fmt.Errorf %w'],
  snippet:`package authority

import (
	"errors"
	"fmt"
)

// Move is what the client asks for: an intent, never a position.
type Move struct {
	Seq    uint32
	DX, DY float64
}

type Player struct {
	X, Y    float64
	LastSeq uint32
}

const maxStep = 1.0

var ErrIllegal = errors.New("illegal move")

// Apply checks the request and changes state only if it is allowed.
func (p *Player) Apply(m Move) error {
	if m.Seq <= p.LastSeq {
		return fmt.Errorf("seq %d already applied: %w", m.Seq, ErrIllegal)
	}
	// Written so that NaN is rejected: any comparison with NaN is false.
	if !(m.DX*m.DX+m.DY*m.DY <= maxStep*maxStep) {
		return fmt.Errorf("step longer than %v: %w", maxStep, ErrIllegal)
	}
	p.X += m.DX
	p.Y += m.DY
	p.LastSeq = m.Seq
	return nil
}
`,
  pitfall:'Accepting the position or the result from the client and only sanity-checking it. Send inputs and let the server compute the outcome; a check on a claimed value always has a gap.'
});

T('server-determinism',{ d:'server', t:'Deterministic simulation and parity', tag:'Two machines, one answer, bit for bit. Everything else is a guess wearing a checksum.',
  what:`Making a simulation produce exactly the same output from the same input on every machine that runs it, and proving it continuously. That means a seeded random source both sides implement identically, arithmetic that cannot drift, a fixed step that does not depend on frame rate, and a parity test that runs recorded inputs through both implementations and diffs the traces bit for bit.`,
  why:[`It is the precondition for client-simulate-server-verify, for lockstep, and for replays that still play back a year later.`,`Floating point drift is silent. A result that is wrong in the last bit today is a visibly different match outcome after ten thousand ticks.`,`Without a parity test in continuous integration, determinism decays with the next optimisation. Nobody breaks it on purpose.`,`It turns a cheating question into an arithmetic question, which is the only version of that question you can win.`],
  think:{ q:[`Which values must match exactly, and which are presentation that may differ freely?`,`Where does randomness enter, and is every source of it seeded and ordered?`,`Does the simulation read anything that varies per machine: frame time, wall clock, collection iteration order, thread scheduling, hardware capability?`,`Can I record an input trace and replay it to the same result on the same machine, before I even ask about two machines?`,`What is the smallest unit I can hash and compare, and how often do I compare it?`],
    trade:[`Integer or fixed-point maths is trivially deterministic and costs precision, range, and a rewrite of any formula you borrowed.`,`Floating point keeps the formulas readable and demands frozen implementations of every transcendental function plus compiler flags that forbid contraction, which is a permanent constraint on both toolchains.`],
    traps:[`Using the engine’s global random source inside the simulation. It is shared with effects, animation and anything else that pulls from it, so the sequence depends on what else ran.`,`Iterating a hash map or dictionary and assuming order. It differs between runtimes and between runs.`,`Letting the compiler fuse a multiply and an add. The fused result is more accurate and therefore different, which is worse than being wrong the same way everywhere.`,`Feeding delta time into the simulation. The simulation gets a tick count, the renderer gets delta time.`,`Regenerating golden traces to make a failing test pass. That deletes the evidence that the change altered behaviour.`],
    good:[`One command replays a recorded match and prints a trace hash identical to the one stored with it.`,`A change that alters simulation output fails a test before it reaches review, and the author has to say why.`],
    bad:[`Desyncs are described as rare and are closed as not reproducible.`,`The team has a tolerance epsilon for comparing two simulations, which means they are not comparing simulations.`] },
  how:[`Draw a hard boundary. The simulation is a pure function of seed plus inputs plus tick count. Nothing inside it reads the clock, the frame rate, the screen or the network.`,`Give the simulation its own random generator, constructed from the seed, used in a fixed order, never shared with presentation.`,`Choose the arithmetic and write it down. Either fixed point throughout, or floats with a frozen implementation of every function that could vary, compiled with contraction disabled on both sides.`,`Record input traces from real play and store them as fixtures, together with the trace hash they produced.`,`Make the parity test a gate in continuous integration: run each fixture through both implementations, diff the traces bit for bit, fail on the first differing tick and print it.`,`Treat a golden-trace update as a separate, reviewed change that states what behaviour was deliberately altered.`,`Log the tick index and the state hash at intervals during real matches so a desync report names the tick where it started.`],
  ai:{ yes:[`Audit a simulation function for non-deterministic inputs: clock reads, unordered iteration, shared random sources, frame-dependent maths.`,`Port a formula to fixed point and list every place precision was lost.`,`Write the harness that replays a fixture and diffs two traces, including the report that prints the first differing tick and the values around it.`,`Explain why a specific pair of expressions can produce different results under contraction or different rounding.`],
       no:[`Certify that an implementation is deterministic. Only the parity test says that, and only for the inputs it ran.`,`Pick the epsilon. If you are choosing a tolerance, you have already left the deterministic design.`,`Regenerate golden traces on its own. That is exactly the change a human must justify.`] },
  prompts:[{l:'Determinism audit',p:`Here is the simulation code that must produce identical results on two runtimes: [CODE]. List every source of non-determinism you can see, grouped as: unseeded or shared randomness, clock or frame-rate dependence, unordered iteration, floating-point operations that may be contracted or rounded differently, and platform-dependent library calls. For each, give the smallest change that removes it and say what it costs.`},
    {l:'Parity harness',p:`We have a simulation implemented twice, in [LANGUAGE A] and [LANGUAGE B]. Inputs are a seed and a list of per-tick input records. Design a parity test that records fixtures from real play, replays them through both, and fails on the first differing tick. Specify the trace format, what is included and deliberately excluded, how fixtures are stored and versioned, and the rule for when regenerating a fixture is legitimate.`}],
  verify:[`Does the trace include every value the game’s outcome depends on, and exclude presentation values that are allowed to differ?`,`Is the parity test comparing bit patterns, or comparing within a tolerance?`,`When a fixture was last regenerated, does the change that did it say which behaviour it intentionally altered?`],
  test:[`Replay every stored fixture through both implementations on every change to either side. Measure the first differing tick, not a pass count.`,`Run the same fixture on the oldest and newest supported device and on the server, and compare all three. Parity between two machines you own is not parity.`,`Instrument live matches with a periodic state hash. Measure how many sessions ever disagree, and keep the tick index when they do.`],
  rel:[['procedural-content','Seeded generation is the same problem: the same seed has to produce the same world on every machine, forever.'],['quality-and-build-health','A golden-trace gate is build health. It is the test that tells you a refactor changed the game.'],['server-authority','Client-simulate-server-verify only works if the two simulations agree bit for bit.'],['server-anticheat','Re-simulation is the detection mechanism, and it is worthless the moment parity is not proven.'],['backend-testing','Fixtures, golden traces and the rule against weakening an assertion are testing policy before they are netcode.'],['server-rollback-netcode','Lockstep and rollback both stand on this: bit-exact simulation from the same inputs.']],
  tech:[
    {n:'Fixed-point arithmetic', how:`Represent every simulation quantity as a scaled integer. Multiplication and division carry the scale explicitly. Trigonometry and roots come from tables or integer algorithms.`, fit:`Lockstep games, cross-platform simulation where one of the runtimes you do not control, long matches where drift accumulates.`, cost:`Every formula is rewritten and reviewed for range and precision. Overflow becomes a real bug class. Designers lose the intuition of reading a value.`, alt:`Floats with frozen functions, when both runtimes are yours and you can control the compiler.`},
    {n:'Floats with frozen transcendentals', how:`Keep IEEE-754 doubles, but replace every library function whose implementation may vary with your own fixed implementation, and compile both sides with fused multiply-add contraction disabled.`, fit:`Two runtimes you own, formulas you want to keep readable, a port of an existing float simulation.`, cost:`A permanent constraint on both toolchains. A compiler upgrade or a new platform can reopen the question. The frozen functions need their own tests.`, alt:`Fixed point, if you are writing the simulation from scratch anyway.`},
    {n:'Input-trace replay', how:`Store only the seed and the per-tick inputs. Reproduce any match by replaying them through the current simulation.`, fit:`Bug reproduction, anti-cheat re-simulation, compact replay storage.`, cost:`A replay only plays back on a build whose simulation still matches. Old replays break with every deliberate balance change unless you version them.`, alt:`Recording the full state stream, which always plays back and costs orders of magnitude more storage.`},
    {n:'Periodic state hashing', how:`Hash the simulation state every N ticks and exchange the hash. On mismatch, stop and report the tick, the hash and the recent inputs.`, fit:`Lockstep and any peer simulation, as the detection net that catches drift you did not predict.`, cost:`Bandwidth and a hash cost every N ticks. Tells you that you desynced, never why.`, alt:`Full trace diffing offline, which finds the cause but cannot run live.`}
  ] });
ENGINE('server-determinism',{
  godot:{ term:`Determinism is not a Godot feature, it is a boundary you enforce. The simulation becomes a plain RefCounted class outside the scene tree, seeded by its own small integer generator, stepped by a tick count rather than by delta. Built-in generators such as RandomNumberGenerator are not a cross-runtime specification, so a server in another language cannot reproduce them; both sides implement the same few lines.`,
    api:['a hand-written integer generator (an LCG), not RandomNumberGenerator, when the server is not Godot','RefCounted (simulation outside the SceneTree)','Engine.physics_ticks_per_second','PackedInt64Array / PackedByteArray','hash() / String.sha256_buffer()','Node._physics_process(delta) for presentation only'],
    snippet:`class_name Sim extends RefCounted

var _s := 0

func _next() -> int:                         # the same three lines exist in the Go server
\t_s = (_s * 1103515245 + 12345) & 0x7fffffff
\treturn _s

func run(run_seed: int, inputs: PackedInt32Array) -> PackedInt64Array:
\t_s = run_seed & 0x7fffffff               # seed, never randomize()
\tvar trace := PackedInt64Array()
\tvar x := 0
\tfor i in inputs.size():
\t\tx += inputs[i] * 16 + _next() % 16       # integers only
\t\ttrace.append(x)
\treturn trace                             # hash this and send it with the result`,
    pitfall:`Reaching for the global randi() or calling randomize() anywhere in the project. The global generator is shared with particles, spawn jitter and anything else that pulls from it, so the sequence your simulation sees depends on what else happened to run that frame. The same applies to iterating a Dictionary: Godot 4 keeps insertion order, so the order is stable only if both sides insert in the same order, and a Go map has no order at all. Own your generator, own your iteration order.`,
    map:`On both engines the hand-written generator replaces the built-in ones (RandomNumberGenerator, System.Random), and the global randi() is Unity’s static UnityEngine.Random.` },
  unity:{ term:`Determinism means the simulation is a plain C# class with no UnityEngine dependency: no Time, no Random, no physics. It takes a seed and an input array and returns a trace, so an EditMode test and the server can both run it.`,
    api:['a hand-written integer generator (never UnityEngine.Random, and System.Random is not a cross-runtime spec)','Time.fixedDeltaTime (presentation only)','Physics.simulationMode = SimulationMode.Script / Physics.Simulate()','System.Runtime.CompilerServices.MethodImpl','decimal or long fixed-point maths','UnityEngine.TestTools EditMode tests'],
    snippet:`public static class Sim {
    const int TickMs = 16;                       // integer step, not deltaTime

    public static long[] Run(int seed, int[] inputs) {
        long s = seed & 0x7fffffff;              // own generator, the same lines exist in the Go server
        var trace = new long[inputs.Length];
        long x = 0;
        for (int i = 0; i < inputs.Length; i++) {
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            x += inputs[i] * TickMs + s % 16;
            trace[i] = x;
        }
        return trace;                            // the server re-runs this exact function
    }

    public static long Hash(long[] trace) {      // FNV-1a style, easy to port
        unchecked {
            long h = 1469598103934665603;
            foreach (var v in trace) h = (h ^ v) * 1099511628211;
            return h;
        }
    }
}`,
    pitfall:`Assuming PhysX gives the same result on two machines. Unity’s PhysX repeats results at best on one machine and one build when objects are added in the same order, and is not deterministic across platforms or builds, so a simulation built on Rigidbody results cannot be verified server side. If the outcome must match, the outcome cannot come from the physics engine. Use physics for feel and a separate integer simulation for anything the server checks.`,
    map:`Unity’s rule of keeping the simulation free of UnityEngine types is Godot’s rule of keeping it in a RefCounted outside the SceneTree.` },
  note:`The engine side of parity is mostly subtraction. Everything convenient the engine offers inside a frame, from its global random source to its physics solver, is a machine-specific result. What survives the trip to a server is the code that would run identically in a console application.` });
INTERVIEW('server-determinism',{
  junior:[
    { q:`What does it mean for a simulation to be deterministic, and why does a game server care?`,
      a:`Same seed, same inputs, same output, every time, on every machine. Give the concrete reason a server cares: it is the precondition for re-running a client’s claimed result and trusting the comparison, and for replays that still play back later. Contrast it with “looks the same,” which is not the bar.`,
      follow:`What’s the smallest test you could write to prove a piece of code meets that bar?`,
      red:`Describes determinism as “the game runs the same on my machine every time” without mentioning a second machine.` },
    { q:`Why is a shared global random number generator dangerous inside a simulation that needs to be deterministic?`,
      a:`The global generator is pulled from by particles, spawn jitter, UI, anything else running that frame, so the sequence the simulation sees depends on what else happened to run. Say the fix: the simulation owns its own generator, constructed from the seed, used in a fixed order, never shared.`,
      follow:`What else besides randomness can silently make two runs diverge?`,
      red:`Says “we seed the random generator” without addressing whether it’s shared with anything else.` },
    { q:`If floating point math can differ between machines, why not just use it and add a small tolerance when comparing results?`,
      a:`A tolerance means you have stopped comparing simulations and started guessing how wrong is acceptable, and the gap compounds over thousands of ticks into a different match outcome. Name the two real fixes: fixed-point arithmetic, or floats with every function that could vary frozen and compiler fusion disabled on both sides.`,
      follow:`What would make you choose fixed point over frozen floats, or the reverse?`,
      red:`Proposes an epsilon comparison as the actual solution rather than as a symptom of a non-deterministic system.` }
  ],
  mid:[
    { q:`You’re asked to add a parity test to CI for a simulation shared between client and server. What does that test check, and what happens when it fails?`,
      a:`Replay recorded input fixtures through both implementations and diff the resulting traces bit for bit, failing on the first differing tick and printing it. On failure, the change is rejected until a human either fixes the divergence or, in a separate reviewed change, explains what behaviour was intentionally altered and updates the golden trace. Never regenerate the trace to make the failure go away silently.`,
      follow:`Someone on the team wants to bump the golden trace in the same commit that fixed a bug. What’s your objection?`,
      red:`Treats a failing parity test as something to work around rather than a signal to investigate.` },
    { q:`How would you audit an existing simulation function for hidden non-determinism?`,
      a:`Check for clock or frame-rate reads, unseeded or shared random sources, iteration over a hash map or dictionary that assumes order, and any library call whose result can vary by platform or compiler flag. Walk through how you’d find each class of bug in real code, not just list the categories.`,
      follow:`You find a call to a trig function from the platform math library. Is that automatically a problem?`,
      red:`Lists the categories from memory but can’t point to what in actual code would trigger each one.` },
    { q:`Your game uses Unity’s or Godot’s built-in physics for movement. Can the server verify a physics-derived outcome?`,
      a:`No, not directly. The physics engine is not guaranteed deterministic across platforms, builds, or even solver iteration counts, so an outcome that came from it cannot be re-simulated and trusted. Say the actual fix: if the outcome must be verified, it has to come from a separate deterministic simulation, and the physics engine is used for feel only.`,
      follow:`What would you tell a designer who wants ragdoll physics to affect a competitive outcome?`,
      red:`Assumes physics determinism is a settings toggle rather than a fundamental limitation of most physics engines.` }
  ],
  senior:[
    { q:`You’re seeing occasional desync reports in production that nobody can reproduce. How do you approach it?`,
      a:`Start from what’s already instrumented: periodic state hashes logged during real matches, so a report at least narrows to a tick range instead of “sometimes.” If that doesn’t exist yet, add it first. Then treat “rare and not reproducible” as an unacceptable classification and push for a minimal repro from the nearest hash mismatch. Say what you’d do if the divergence traces to a compiler optimisation rather than application code.`,
      follow:`The divergence only appears on one specific device model. What does that suggest, and how do you confirm it?`,
      red:`Accepts “rare, not reproducible” as a closed state without instrumenting anything new.` },
    { q:`How do you decide between fixed-point arithmetic and frozen floating point for a new deterministic simulation, and what would change your mind later?`,
      a:`Fixed point costs a rewrite of every formula and a new intuition for designers, but is trivially deterministic and holds up across any pair of runtimes. Frozen floats keep formulas readable but impose a permanent constraint on both toolchains that a compiler upgrade or new platform can reopen. Choose based on whether you control both runtimes and whether the simulation is new or ported. Name the event that would force a reconsideration: a platform you don’t control entering the mix.`,
      follow:`A publisher requirement adds a third runtime you don’t control. Does that change the decision?`,
      red:`Presents the choice as purely a style preference with no cost attached to either side.` }
  ] });

GO('server-determinism', {
  api:['rand.New', 'rand.NewPCG', 'Rand.IntN', 'append'],
  snippet:`package sim

import "math/rand/v2"

type Match struct {
	tick int
	rng  *rand.Rand
	Hits []int
}

// NewMatch seeds a private generator, so the match never touches global state.
func NewMatch(seed uint64) *Match {
	return &Match{rng: rand.New(rand.NewPCG(seed, seed^0x9e3779b97f4a7c15))}
}

// Step advances exactly one fixed tick. The same seed and the same inputs
// in the same order give the same match.
func (m *Match) Step(inputs []int) {
	for _, in := range inputs {
		damage := 10 + m.rng.IntN(5)
		m.Hits = append(m.Hits, in*damage)
	}
	m.tick++
}
`,
  pitfall:'Ranging over a map inside the step. Go randomises map iteration order on purpose, so two runs of the same match diverge. Iterate a sorted slice of keys instead. Also, the standard library does not promise that IntN gives the same numbers in a later Go version. If you store replays, write a small generator yourself or vendor one.'
});

EXPLAINER('server-determinism', { kind:'explainer', title:'Two machines, same inputs, one difference',
  frames:[
    { t:'Frames 1 to 99: identical state on both machines', spec:{ kind:'matrix', rows:['Inputs','Checksum'], cols:['Machine A','Machine B'], cells:[['same','same'],['7f3a','7f3a']] } },
    { t:'Frame 100: one float sum runs in a different order', d:'(a + b) + c and a + (b + c) can differ in the last bit; so can a different CPU instruction or library.', spec:{ kind:'matrix', rows:['Inputs','Checksum'], cols:['Machine A','Machine B'], cells:[['same','same'],['91c2','91c3']] } },
    { t:'The difference grows each frame: a desync', d:'A unit is one pixel off, then misses a hit, then a fight ends differently.', spec:{ kind:'curve', x:'Frames after 100', y:'Difference between A and B', alt:'The difference starts at one bit and grows until the two games no longer agree.', series:[{ t:'Divergence', pts:[[0,0.02],[0.3,0.05],[0.6,0.3],[1,0.95]] }] } },
    { t:'Compare checksums every frame to catch it at frame 100', d:'Log the inputs and the frame; replay both to find the line that differs.', spec:{ kind:'flow', steps:[{ id:'h', t:'Hash the state' }, { id:'s', t:'Exchange hashes' }, { id:'c', t:'Compare', d:'frame 100 differs' }, { id:'r', t:'Replay and diff' }], edges:[['h','s'],['s','c'],['c','r']] } }
  ] });

T('server-state-sync',{ d:'server', t:'State sync and tick rates', tag:'Send what changed, at a rate someone chose on purpose, and decide whether the client waits or guesses.',
  what:`How the authoritative state reaches the machines that only display it. Three decisions sit inside it: what you send (the whole state, a snapshot, or only the fields that changed since this client last acknowledged), how often you send it, and what the receiver does between messages. The receiver either interpolates between the last two known states and lives slightly in the past, or predicts forward from local input and reconciles when the truth arrives. Counter-Strike 2’s sub-tick model shows a fourth option: keep a fixed simulation tick but timestamp each input to the instant it happened, so two players who acted a few milliseconds apart within the same tick still resolve in that order.`,
  why:[`Bandwidth and cost scale with what you send times how often times how many players see it. This is the single largest running cost of a realtime game.`,`Interpolation and prediction produce different games. Interpolated remote players are always behind, predicted local players sometimes rewind. Both are visible to players and both need design.`,`Tick rate sets the resolution of fairness. Two players can only be distinguished by the simulation at the granularity it ticks.`,`Outside realtime matches the same idea pays for itself: returning only the state a request changed turns a large response into a small one.`],
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
  verify:[`Is every replicated field justified by a named consumer, or is the list just the entity’s public members?`,`Is the interpolation buffer derived from measured jitter, and is the measurement still running in production?`,`Does the delta scheme have a defined recovery when an acknowledgement is lost, and has that path been exercised?`],
  test:[`Measure bytes per second per player at the busiest moment of a real match, not at idle. Compare it against the budget you set before building.`,`Add 5 percent packet loss and 150 ms of jitter on one client and watch remote entities. Measure how long a visible artefact lasts and whether it self-corrects.`,`Force a reconciliation of a large distance and show it to players without telling them what happened. Ask them what they think the game did.`],
  rel:[['game-feel-and-juice','Interpolation delay and correction snap are felt as responsiveness long before anyone calls them netcode.'],['feedback-and-affordance','A correction the player cannot interpret is feedback that teaches the wrong lesson about their own input.'],['server-authority','Sync is how the authoritative decision travels. The model decides what is even worth sending.'],['server-realtime-protocol','Delta sync, acknowledgements and channel reliability are protocol decisions before they are gameplay ones.'],['backend-data-access','Returning only the tables a request dirtied is the same delta idea applied to stored player state.']],
  tech:[
    {n:'Snapshot interpolation', how:`The client buffers the last few authoritative states and renders an interpolated point between them, deliberately a fixed delay behind the server.`, fit:`Remote entities in almost every realtime game. The default until something demands otherwise.`, cost:`Everything the client sees of other players is in the past. Aiming at another player means aiming where they were.`, alt:`Extrapolation forward, which removes the delay and invents motion that did not happen.`},
    {n:'Client prediction and reconciliation', how:`The client applies local input immediately and keeps the input history. When an authoritative state arrives it rewinds to that state and replays the inputs that came after it.`, fit:`The local player’s own movement, where any delay is felt as input lag.`, cost:`The predicted part, usually the local player’s movement, must be re-runnable from a past state and close to the server’s result. It need not be bit-exact, because the server’s state overwrites it, but every misprediction is a visible correction.`, alt:`Accept the round trip and hide it with animation wind-up, which is cheaper and only works for slow actions.`},
    {n:'Delta sync against acknowledged state', how:`The server tracks what each client last confirmed receiving and sends only the fields that changed since. Requests outside the match do the same with a dirty-set and a generation counter.`, fit:`Large state where most of it is static between updates. Inventories, world objects, player profiles.`, cost:`Per-client bookkeeping on the server and a recovery path for a lost acknowledgement. A client with a stale generation must be able to ask for everything.`, alt:`Periodic full snapshots, which cost bandwidth and never desync.`},
    {n:'Interest management', how:`Each client is sent only the entities relevant to it, chosen by distance, region, team or visibility, with the set recomputed as they move.`, fit:`Any world larger than one screen, and the first thing to reach for when bandwidth grows with player count.`, cost:`Entities entering the interest set need a full state on entry. Incorrect culling shows as objects popping into existence.`, alt:`Sending everything to everyone, which is fine until it is suddenly not.`}
  ] });
ENGINE('server-state-sync',{
  godot:{ term:`Replication is declared on a MultiplayerSynchronizer node with a SceneReplicationConfig listing the properties to send and their sync mode. MultiplayerSpawner replicates the existence of nodes, the synchronizer replicates their values.`,
    api:['MultiplayerSynchronizer.replication_config','SceneReplicationConfig.add_property() / property_set_sync()','MultiplayerSpawner.spawn_function','MultiplayerSynchronizer.replication_interval / delta_interval','Node.set_multiplayer_authority()','@rpc("authority", "unreliable_ordered")'],
    snippet:`extends CharacterBody2D

var net_position := Vector2.ZERO          # the replicated property

func _physics_process(delta: float) -> void:
\tif multiplayer.is_server():
\t\tvelocity = _server_step()
\t\tmove_and_slide()
\t\tnet_position = global_position
\telse:                                  # remote peers ease toward the last received state
\t\tglobal_position = global_position.lerp(net_position, 1.0 - pow(0.001, delta))`,
    pitfall:`Leaving replication_interval (and delta_interval) at 0, which syncs on every network process frame, so the send rate follows the frame rate rather than a rate anyone chose, and bandwidth is spent before anyone has looked at it. Set the interval per synchronizer against what that entity needs, and put anything that only changes on an event behind an RPC instead of a replicated property.`,
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
    pitfall:`Writing a NetworkVariable every tick with a value that drifts by a hair. The setter already skips a value equal to the current one, but a float position that moves a millimetre is a new value, so it sends on every tick; a List edited in place sends nothing until CheckDirtyState is called. Assign only when the value changed, set a position threshold on NetworkTransform, and never put presentation state such as animation blend weights into a NetworkVariable.`,
    map:`Unity NetworkVariable is Godot’s replicated property in a SceneReplicationConfig, and NetworkTickSystem is what you build yourself in Godot from a physics tick counter.` },
  note:`Both engines will happily replicate everything you mark, which is the trap. The design work is the replication table: per field, who needs it, how stale it may be, and whether a lost update repairs itself. The engine attribute is the last five minutes of that work.` });
INTERVIEW('server-state-sync',{
  junior:[
    { q:`What’s the difference between interpolating a remote player and predicting your own player’s movement?`,
      a:`Interpolation renders a point between the last two known authoritative states, so the remote player is always slightly in the past. Prediction applies local input immediately and reconciles against the authoritative answer when it arrives, so it can feel instant but sometimes has to correct itself. Say which one you’d use for the local player and which for everyone else, and why.`,
      follow:`What does a player see when a predicted action gets corrected?`,
      red:`Cannot say which strategy applies to the local player versus remote players.` },
    { q:`Why does tick rate matter for fairness, not just for smoothness?`,
      a:`Two players can only be distinguished by the simulation at the granularity it ticks, so a low tick rate can decide who “got there first” incorrectly. Give a concrete example, like two players reaching for the same pickup within the same tick window.`,
      follow:`If you doubled the tick rate, what would that cost, and is it worth it for that example?`,
      red:`Treats tick rate purely as a smoothness or bandwidth knob with no fairness implication.` },
    { q:`Why send only the fields that changed instead of the whole entity state every time?`,
      a:`Bandwidth is spent per field, and most of an entity’s state is static between updates, so sending everything wastes cost that scales with tick rate times player count times entity count. Say what a delta scheme needs in exchange: tracking what each client last acknowledged.`,
      follow:`What happens if the client’s acknowledgement gets lost?`,
      red:`Says “delta compression” without being able to explain what it’s diffing against.` }
  ],
  mid:[
    { q:`How would you decide the interpolation buffer size for remote players in a real game, rather than picking a number that felt right?`,
      a:`Measure real jitter on real connections as a rolling average, and set the buffer from that measurement, not from a constant chosen once. Say what happens when the buffer is too small: stutter on exactly the connections that most need help. Describe how you’d validate the choice with players on a bad connection, not just on your office network.`,
      follow:`Your measured jitter varies wildly by region. Do you use one global buffer or one per region?`,
      red:`Picks a buffer size from a forum post and never revisits it against real telemetry.` },
    { q:`You need to estimate bandwidth per player before building the replication layer. Walk me through it.`,
      a:`List the entities and fields that must replicate, mark who needs each one and at what staleness, then multiply message size by tick rate by player count for the worst realistic moment, not idle. Flag any field that looks like it’s presentation rather than gameplay state and shouldn’t be on the wire at all. Show the arithmetic, don’t just give a final number.`,
      follow:`Your estimate is under budget in a two-player test and over budget at twenty players. What does that tell you?`,
      red:`Gives a bandwidth number with no arithmetic behind it and no mention of what’s being replicated.` },
    { q:`A designer wants to predict a purchase result locally for responsiveness. What’s your objection?`,
      a:`Prediction only works for things that can be corrected gracefully, and a purchase or a death is not one of them, you cannot un-show a player their new item without it reading as a bug. Say what you’d predict instead, like movement, and what you’d do for the purchase, like a short wait with clear feedback that the request is in flight.`,
      follow:`What’s an example of state that looks predictable but can’t be corrected gracefully?`,
      red:`Agrees to predict the purchase and plans to “just roll it back visually” if it fails.` }
  ],
  senior:[
    { q:`Remote players are teleporting in a live game and the proposed fix is raising the tick rate. How do you respond?`,
      a:`Raising tick rate multiplies bandwidth and cost linearly and may not touch the actual cause. Ask first what happens on packet loss and whether the interpolation buffer is sized from measured jitter, because teleporting usually means updates are arriving with no recovery path or the buffer is smaller than real jitter. Describe how you’d instrument to tell the difference before spending on tick rate.`,
      follow:`You confirm the buffer is fine but three consecutive updates are being dropped on some connections. What’s your fix?`,
      red:`Approves the tick rate increase without first checking whether packet loss or buffering is the real cause.` },
    { q:`Design the replication strategy for a game with a mix of a local player, twenty remote players, and a shared world of static and dynamic objects.`,
      a:`Different strategy per entity class: local player predicted with reconciliation, remote players interpolated with a jitter-derived buffer, dynamic world objects delta-synced against acknowledged state, static objects sent once on entering interest. Add interest management so a client only receives entities relevant to it. Name the corner case that breaks each strategy and how you’d catch it in testing.`,
      follow:`An object crosses from outside a client’s interest set to inside it. What does that client need to receive at that exact moment?`,
      red:`Applies one replication strategy uniformly to every entity type regardless of its role.` }
  ] });

GO('server-state-sync', {
  api:['time.NewTicker', 'select', 'context.Context.Done', 'Ticker.C'],
  snippet:`package tick

import (
	"context"
	"time"
)

type World interface {
	Step()
	Snapshot() []byte
}

// Run simulates at 60 Hz and sends a snapshot every third tick (20 Hz).
func Run(ctx context.Context, w World, send func([]byte)) {
	t := time.NewTicker(time.Second / 60)
	defer t.Stop()
	for n := 1; ; n++ {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			w.Step()
			if n%3 == 0 {
				send(w.Snapshot())
			}
		}
	}
}
`,
  pitfall:'Assuming the ticker keeps up. If Step takes longer than the interval, ticks are dropped without any error and the simulation runs slow. Measure Step and log when it exceeds the budget.'
});

EXPLAINER('server-state-sync', { kind:'explainer', title:'Snapshots, interpolation and prediction',
  note:'Typical numbers: the server sends 20 snapshots a second (every 50 ms); the client draws at 60 frames a second and buffers about 100 ms.',
  frames:[
    { t:'The server sends a snapshot every 50 ms', spec:{ kind:'flow', steps:[{ id:'s', t:'Server tick', d:'20 Hz' }, { id:'n', t:'Snapshot', d:'positions, ids' }, { id:'c', t:'Client buffer', d:'arrives jittered' }], edges:[['s','n'],['n','c']] } },
    { t:'Other players are drawn 100 ms in the past, between two snapshots', d:'Showing the past costs a little delay and buys smooth motion through late or lost packets.', spec:{ kind:'stack', layers:[{ t:'Snapshot at t-150', d:'older' }, { t:'Drawn: t-100', d:'blend 50 percent' }, { t:'Snapshot at t-50', d:'newer' }] } },
    { t:'Your own character is predicted, not waited for', d:'The client applies your input at once and keeps it, numbered, until the server confirms it.', spec:{ kind:'stack', layers:[{ t:'Input 41 applied', d:'confirmed' }, { t:'Input 42 applied', d:'pending' }, { t:'Input 43 applied', d:'pending' }] } },
    { t:'The server disagrees about input 42', d:'Reset to the server\'s state for 42 and re-apply 43 on top: reconciliation.', spec:{ kind:'flow', steps:[{ id:'r', t:'Server state at 42' }, { id:'a', t:'Re-apply 43' }, { id:'d', t:'Draw', d:'small correction' }], edges:[['r','a'],['a','d']] } },
    { t:'What each technique trades', spec:{ kind:'matrix', rows:['Interpolate','Predict'], cols:['Buys','Costs'], cells:[['smooth remote motion','about 100 ms of delay'],['instant own input','corrections, more code']] } }
  ] });

CLIP('server-state-sync', { src:'assets/clips/snapshot-interpolation.webm', poster:'assets/clips/snapshot-interpolation.webp', title:'Raw snapshots against interpolation',
  text:'A remote player moving in a circle, with the server sending 20 snapshots a second. On the left the newest snapshot is drawn as it arrives, so the player jumps 20 times a second. On the right the client draws 100 ms in the past, blending between the two snapshots around that moment, so the motion is smooth at 60 frames a second at the cost of that small delay.' });

T('server-realtime-protocol',{ d:'server', t:'Realtime protocol design', tag:'A length, an op code, a message id, a payload. Everything else is a decision you should be able to defend.',
  what:`The wire format and dispatch rules of a persistent connection. A framed binary envelope carrying an op code and a message id, a schema for the payload, a rule for which messages are reliable and ordered and which may be dropped, a way to correlate a reply with the request that caused it over a socket that also pushes unsolicited events, and an authentication step that must happen before any op that touches state.`,
  why:[`The connection is stateful and long lived, so protocol mistakes are not one bad request. They corrupt a session and every message after it.`,`Op codes plus a generated schema make the protocol reviewable. A free-form message body makes every change a guess about who else is parsing it.`,`Reliability is a per-message decision. Making everything reliable and ordered converts one lost packet into a stall for every message behind it.`,`The same socket carries both replies and pushes. Without correlation ids the client cannot tell an answer from an announcement.`],
  think:{ q:[`Does this message need to arrive, and does it need to arrive in order relative to the messages around it?`,`What does the receiver do with a message whose op code it does not recognise, and is that forward compatible?`,`Which ops are legal before authentication, and is that list as short as it can be?`,`How does a reply find the caller that is waiting for it?`,`What is the largest payload this transport will carry, and what happens at one byte more?`],
    trade:[`A generated schema gives type safety, small frames and cheap evolution, and costs a code generation step in both builds plus a version to keep in step.`,`Text messages are trivially debuggable and cost bandwidth, parsing and the discipline nobody keeps.`,`One socket for everything is simple and couples chat latency to gameplay latency. Separate connections isolate them and double the connection state to manage.`],
    traps:[`Handling any stateful op before authentication has completed, because the switch statement grew a new case and nobody re-read the guard.`,`Silently upgrading an unreliable message to the reliable channel when it exceeds a size ceiling, and not saying so, so an occasional large payload quietly changes ordering.`,`Assuming one socket read is one message. Raw TCP is a byte stream, so a slow network hands you half a frame or two frames at once: length-prefix and buffer. WebSocket keeps message boundaries, but a client such as .NET’s ClientWebSocket still returns a large message in pieces until EndOfMessage is true.`,`Dispatching the payload straight onto the thread the socket read it on, then touching engine objects from there.`,`Numbering op codes by insertion order in a shared enum, so two branches merge into the same value.`],
    good:[`One table lists every op code with its direction, its reliability, whether it requires auth, and its payload type.`,`A new message type is added by changing the schema and the table, and both clients fail to build until they handle it.`],
    bad:[`Message handling is a long switch with no guard and no default case.`,`Nobody can say which messages are allowed to be dropped.`] },
  how:[`Define the frame first: a length prefix, an op code, a message id, then the payload. Write it down as a table, not as a comment in the reader.`,`Generate the payload types from one schema for both sides. Never hand-write a struct on one end and hope.`,`Mark each op with its reliability and its auth requirement in the same table, and enforce auth in one place before the dispatch switch, not inside the cases.`,`Correlate replies by echoing the message id. Keep a pending map with a timeout so a lost reply fails the caller instead of hanging it.`,`Marshal onto the main thread at exactly one point, and make every handler downstream of that point assume it is there.`,`Handle unknown op codes by logging and ignoring, so an older client survives a newer server.`,`Decide the size ceiling and what happens above it, and make the degradation explicit and logged rather than automatic and silent.`,`Keep a protocol version in the handshake so an incompatible pair fails at connect with a message the player can act on.`],
  ai:{ yes:[`Draft the op-code table from a list of interactions, including direction, reliability and auth requirement.`,`Write the framing reader and writer including the partial-message buffering case and the oversized-payload case.`,`Review a protocol for ops reachable before authentication and for missing default handling.`,`Generate the reply-correlation layer with timeouts and cancellation.`],
       no:[`Decide which messages may be lost. That is a gameplay judgement about what the player would notice.`,`Design the schema evolution policy for clients you cannot force to update.`,`Assume a transport’s guarantees. Verify message framing and size limits against the actual library and platform.`] },
  prompts:[{l:'Protocol table',p:`Here are the interactions our realtime connection must carry: [LIST]. Produce a table with one row per message: op code name, direction, reliable or droppable and why, whether it requires an authenticated session, payload fields, and expected frequency. Flag any message that could be handled before authentication and any pair that must be ordered relative to each other.`},
    {l:'Framing review',p:`Here is our socket read loop and frame parser: [CODE]. Check it against these cases: a message split across two reads, two messages in one read, a payload larger than the size ceiling, an unknown op code, a close arriving mid-frame, and a handler touching engine objects off the main thread. For each, say what the current code does and the smallest fix.`}],
  verify:[`Does the op-code table exist and does the code match it, or is the table a document someone wrote once?`,`Is authentication enforced before dispatch rather than inside individual handlers?`,`Is there a test that feeds the parser a message split across two reads?`],
  test:[`Fuzz the parser with truncated frames, oversized payloads and unknown op codes. Measure that the connection survives or closes cleanly, never that it silently mis-parses.`,`Send a burst of the highest-frequency message and measure main-thread time spent in dispatch. Protocol cost shows up as frame hitches before it shows up as bandwidth.`,`Connect an old client to a new server and a new client to an old server. Measure what the player is told in each direction.`],
  rel:[['platform-and-session','Transport choices are platform choices. Some targets have no raw sockets, and mobile suspend kills connections you assumed were open.'],['social-experience','Chat, presence and party channels ride this protocol, and their latency budget is not the match latency budget.'],['server-state-sync','Reliability, ordering and message size decide what sync strategies are even available.'],['server-scaling','Op codes and channels are the unit that fan-out and sharding are organised around.'],['backend-api-protocol','The request-response API and the realtime socket are two encodings of the same domain, and they should not drift apart.']],
  tech:[
    {n:'Length-prefixed binary frames with a generated schema', how:`Every message is a length, an op code, a message id and a schema-encoded payload. Types are generated for both sides from one definition.`, fit:`Production realtime with more than a handful of message types, and any team where client and server are built separately.`, cost:`A codegen step in both pipelines and a schema version to keep aligned. Debugging needs a decoder tool.`, alt:`Text messages during the first prototype week, then migrate before the message count grows.`},
    {n:'Reliable and unreliable channels', how:`The transport exposes at least two delivery modes. Position streams go unreliable and unordered, state changes go reliable and ordered, each on its own channel so a stall in one does not block the other.`, fit:`Anything with a continuous stream of positions alongside discrete events.`, cost:`Two paths to reason about, and a rule for what happens when an unreliable payload exceeds the transport’s ceiling.`, alt:`All-reliable, which is simpler and turns any loss into a visible stall for everyone.`},
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
    map:`Godot’s WebSocketPeer poll loop is Unity’s async ReceiveAsync loop, and PackedByteArray.encode_u16 is BitConverter or a BinaryWriter.` },
  unity:{ term:`A custom socket lives outside the player loop in an async read task. Frames are parsed from a buffer and then marshalled back to the main thread with the captured SynchronizationContext before any engine object is touched.`,
    api:['System.Net.WebSockets.ClientWebSocket.ReceiveAsync() / SendAsync()','SynchronizationContext.Current / Post()','CancellationTokenSource','BitConverter / System.Buffers.Binary.BinaryPrimitives','UnityWebRequest for the request-response tier','Application.focusChanged and OnApplicationPause for socket teardown'],
    snippet:`async Task ReadLoop(ClientWebSocket ws, SynchronizationContext ctx, CancellationToken ct) {
    var buf = new byte[8192];
    using var msg = new MemoryStream();                      // one whole message, however many fragments
    while (ws.State == WebSocketState.Open) {
        var r = await ws.ReceiveAsync(new ArraySegment<byte>(buf), ct);
        msg.Write(buf, 0, r.Count);                          // append each fragment at the running offset
        if (!r.EndOfMessage) continue;                       // parse only a complete message
        var data = msg.ToArray();
        msg.SetLength(0);
        if (r.MessageType != WebSocketMessageType.Binary) continue;
        ushort op = BitConverter.ToUInt16(data, 0);          // [2 op][4 id][payload]
        uint id = BitConverter.ToUInt32(data, 2);
        var body = data.AsSpan(6).ToArray();
        ctx.Post(_ => Dispatch(op, id, body), null);         // back to the main thread
    }
}`,
    pitfall:`Touching a GameObject, a Transform or anything else from the receive task. The callback runs on a thread pool thread, Unity’s API is main-thread only, and the failure is not always an exception. It can be a silent no-op or a crash minutes later. Post every dispatch through the SynchronizationContext captured on the main thread, and make that the only place the boundary is crossed.`,
    map:`Unity’s SynchronizationContext.Post is what Godot gives you for free by polling inside _process, which is already the main thread.` },
  note:`This is the client half of a server protocol, and the two must be generated from one schema. The op-code table, the reliability column and the auth gate live on the server. The client’s job is to frame correctly, drain the queue, correlate replies by message id and cross the thread boundary exactly once.` });
INTERVIEW('server-realtime-protocol',{
  junior:[
    { q:`What goes into a message frame on a persistent connection, and why does each part matter?`,
      a:`A length prefix so the reader knows where the message ends, an op code so the receiver knows what it is, a message id so a reply can be matched to its caller, and the payload. Say what breaks if the length prefix is missing: on a raw TCP stream a slow network can hand you half a message and the reader has no way to know; over WebSocket the prefix is a cross-check rather than the only boundary.`,
      follow:`What should the reader do if it receives an op code it doesn’t recognise?`,
      red:`Describes the payload only and has no answer for how the reader knows where one message ends.` },
    { q:`Why can’t every message on a realtime connection be both reliable and ordered?`,
      a:`Making everything reliable and ordered means one lost packet stalls every message behind it, including ones where staleness would have been harmless, like a position update. Say which kind of message you’d mark unreliable and why losing it occasionally is fine.`,
      follow:`Give an example of a message that must be ordered relative to another specific message, and why.`,
      red:`Treats “reliable” as simply “better” and can’t name a cost to using it everywhere.` },
    { q:`Why does an op code need to be checked against authentication state before it’s handled?`,
      a:`A persistent connection is stateful, so a mistake here isn’t one bad request, it lets a stateful action through before identity is confirmed. Say where that check should live: one guard before the dispatch switch, not scattered inside individual handlers.`,
      follow:`What’s the smallest set of op codes that should be legal before authentication completes?`,
      red:`Puts the auth check inside each handler and calls that “defence in depth.”` }
  ],
  mid:[
    { q:`Walk me through how you’d design the op-code table for a new realtime feature before writing any code.`,
      a:`One row per message: direction, reliability with a stated reason, whether it requires authentication, payload shape, expected frequency. Flag anything that could be reached before authentication and any pair of messages that must stay ordered relative to each other. Say why this table has to exist as reviewable data, not as knowledge in someone’s head.`,
      follow:`Two messages need to be ordered relative to each other but you’ve put them on separate channels. What do you do?`,
      red:`Jumps to code before there’s an agreed table anyone else can review.` },
    { q:`How do you correlate a reply with the request that caused it, on a socket that also pushes unsolicited events?`,
      a:`Requests carry a message id. The sender keeps a pending map keyed by that id with a timeout, and the receiver echoes the id back on the reply. Unsolicited pushes carry no id, so the client can tell the two apart. Say what happens on a timeout: the caller fails rather than hangs.`,
      follow:`What happens if a reply arrives after its request already timed out?`,
      red:`Assumes every message on the socket is a reply and has no path for unsolicited pushes.` },
    { q:`You’re reviewing a socket read loop. What are the specific bugs you’d check for?`,
      a:`A message split across two reads, two messages arriving in one read, a payload above the size ceiling with no defined behaviour, an unknown op code crashing the parser instead of being logged and ignored, and a handler touching engine objects off the thread that read the socket. Walk through how each shows up in real code.`,
      follow:`You find the parser silently upgrades an oversized unreliable message to the reliable channel. Why is that dangerous even though it “recovers” the message?`,
      red:`Reviews the happy path only and doesn’t mention partial frames or oversized payloads.` }
  ],
  senior:[
    { q:`You need an old client to keep working against a new server for weeks after a protocol change ships. How do you design for that?`,
      a:`Generate payload types from one schema so evolution is additive: new fields, never renumbered or removed identifiers. Make unknown op codes a logged no-op rather than a failure, so an old client surviving a new op set doesn’t break. Put a protocol version in the handshake so a incompatible pair fails at connect with an actionable message rather than mid-session.`,
      follow:`A field needs to be removed entirely, not just deprecated. What’s the actual process?`,
      red:`Plans to force every client to update immediately instead of designing for coexistence.` },
    { q:`Chat and gameplay currently share one socket and one channel. Players report chat lag spikes during intense combat. How do you diagnose and fix it?`,
      a:`Name the coupling directly: one socket means chat latency is coupled to gameplay latency and to whatever’s saturating the connection during combat. Diagnose by measuring main-thread dispatch time and per-channel volume during a busy moment, not by guessing. Propose separating channels or connections so combat traffic can’t starve chat, and name the cost: doubled connection state to manage.`,
      follow:`Splitting into two connections doubles the reconnection logic you have to maintain. Is it still worth it here?`,
      red:`Proposes raising priority on chat messages without addressing the shared channel’s fan-out cost.` }
  ] });
DIAGRAM('server-realtime-protocol', { kind:'stack', title:'One message frame on the wire',
  layers:[{t:'Length', d:'first and fixed size, so the reader knows how much to take'},{t:'Op code', d:'which message this is'},{t:'Message id', d:'pairs a reply with its request'},{t:'Payload', d:'the body, in the encoding both sides agreed'}] });

GO('server-realtime-protocol', {
  api:['binary.BigEndian.PutUint32', 'binary.BigEndian.Uint32', 'io.ReadFull', 'errors.New', 'fmt.Errorf %w'],
  snippet:`package wire

import (
	"encoding/binary"
	"errors"
	"fmt"
	"io"
)

const maxBody = 64 * 1024

var ErrTooLarge = errors.New("message too large")

// WriteFrame writes one byte of type, four bytes of body length, then the body.
func WriteFrame(w io.Writer, kind byte, body []byte) error {
	if len(body) > maxBody {
		return fmt.Errorf("%d bytes: %w", len(body), ErrTooLarge)
	}
	hdr := make([]byte, 5)
	hdr[0] = kind
	binary.BigEndian.PutUint32(hdr[1:], uint32(len(body)))
	if _, err := w.Write(append(hdr, body...)); err != nil {
		return fmt.Errorf("write frame: %w", err)
	}
	return nil
}

func ReadFrame(r io.Reader) (kind byte, body []byte, err error) {
	hdr := make([]byte, 5)
	if _, err = io.ReadFull(r, hdr); err != nil {
		return 0, nil, fmt.Errorf("read header: %w", err)
	}
	n := binary.BigEndian.Uint32(hdr[1:])
	if n > maxBody {
		return 0, nil, fmt.Errorf("%d bytes: %w", n, ErrTooLarge)
	}
	body = make([]byte, n)
	if _, err = io.ReadFull(r, body); err != nil {
		return 0, nil, fmt.Errorf("read body: %w", err)
	}
	return hdr[0], body, nil
}
`,
  pitfall:'Allocating a buffer from the length the peer sent before checking it, which lets one packet claim four gigabytes. Check the length first, and use io.ReadFull because a single Read on TCP may return part of a message.'
});

T('server-matchmaking',{ d:'server', t:'Matchmaking, rooms and sessions', tag:'A ticket, a rule set, a room, and an explicit answer to what happens when someone disappears.',
  what:`Getting the right players into the same session and keeping that session coherent. A ticket carries who is waiting, what capacity the match needs, and the predicates a candidate set must satisfy. A matcher scans open tickets for a satisfying group and hands them to something that creates the session. Around that sit private rooms with join codes, the lifetime rules for a session, and a deliberate policy for disconnection and reconnection.`,
  why:[`Match quality is the first thing players feel about a multiplayer game, and it is a design problem before it is an algorithm.`,`Wait time and match quality trade against each other directly, and the trade has to be chosen rather than emerge from a queue.`,`Session lifetime bugs are the expensive kind. A room that outlives its players costs money forever and a room that dies early loses a match in progress.`,`Reconnection is a product decision with a real cost. Deciding not to support it is legitimate and must be decided, not discovered.`],
  think:{ q:[`What makes a match good for this game: skill, latency, party size, mode, language, or a rule the designers wrote?`,`How long will a player wait before the queue is worse than a bad match, and what do we relax first?`,`Who creates the session, and what is the state of the world between the match being decided and the players being connected?`,`If a player’s app is suspended for thirty seconds, is their seat still theirs, and for how long?`,`How is a private room addressed, and can a player from one environment accidentally join a room in another?`],
    trade:[`Strict predicates give better matches and longer queues. Widening over time fills matches and shows players a worse one late at night.`,`Holding a seat for a disconnected player protects them and degrades the match for everyone still there.`,`Reconnection support is a genuine feature with its own state machine. Treating a disconnect as a session death is far simpler and loses the player’s match.`],
    traps:[`Sharing one application id between development and live builds, so a room code generated by a test build collides with a real one. A single-character environment tag on the code is the cheap fix.`,`A matcher that scans a shared ticket list without a lock, or with a lock held across a network call.`,`Tying the session’s lifetime to a scene. Loading a new scene destroys the object holding the connection.`,`Leaving a room allocated because the last player left through a path that does not run the cleanup.`,`Assuming an operating system suspend is a brief pause. On mobile it can be the end of the process, and the session it owned is already gone.`],
    good:[`A queue report shows median wait and the distribution of how far predicates had to be relaxed.`,`You can describe what happens at every second of a thirty-second disconnect, and someone has watched it.`],
    bad:[`Empty rooms accumulate and are cleaned up by a periodic sweep nobody wants to remove.`,`Players report being matched with someone on another continent and the team has no latency predicate at all.`] },
  how:[`Model the ticket explicitly: the party, the capacity it needs, the predicates it demands, when it entered the queue, and how far it has already been relaxed.`,`Write the relaxation ladder as data. After N seconds widen skill, after M seconds widen latency, and never widen mode. Make the ladder visible in the queue report.`,`Keep the matcher’s scan over the ticket pool short and never hold its lock across a call that can block.`,`Make session creation a single owner. One component allocates the room, hands out its address, and is the only thing that can destroy it.`,`Tag room codes with the environment before they become a session name, so two environments sharing one service cannot collide.`,`Decide the disconnect policy in writing and implement exactly it. If a suspend means session death, tear the session down immediately so no dead session can still be operated.`,`Give the session an owner whose lifetime is the session, not the scene, and make cleanup run on every exit path including the crash path.`,`Instrument the queue: tickets in, wait time, relaxation depth, matches formed, abandoned tickets. Without it match quality is an opinion.`],
  ai:{ yes:[`Turn a description of a good match into explicit predicates and a relaxation ladder with times.`,`Enumerate the session lifecycle states and the transitions between them, including every disconnect and error path.`,`Review a matcher for lock scope, starvation of long-waiting tickets, and unbounded queue growth.`,`Simulate wait time and match quality against a described population and predicate set, stating its assumptions about arrival rate.`],
       no:[`Decide what a good match is. That is the game’s promise about fairness and company.`,`Choose the reconnection policy. It is a product decision with support, fairness and engineering cost.`,`Estimate your real population. Any number it gives you is invented unless you supplied the data.`] },
  prompts:[{l:'Ticket and ladder',p:`Our match needs [CAPACITY] players in mode [MODE]. What makes a match good for us is [CRITERIA]. Turn that into an explicit ticket structure and a relaxation ladder: which predicate widens at which waiting time, by how much, and which predicates never widen. Then list the failure cases: a party too large for the remaining slots, a ticket that has waited beyond the ladder, and a player who cancels while being matched.`},
    {l:'Session lifecycle',p:`Describe the full session lifecycle for this shape: [TOPOLOGY], created by [OWNER], with a disconnect policy of [POLICY]. Enumerate every state and transition including app suspend, network loss, graceful leave, host leave, crash, and the last player leaving. For each transition say who destroys the room, what the remaining players see, and what is left allocated if the transition is missed.`}],
  verify:[`Is the relaxation ladder data someone can read and change, or is it constants inside the matcher?`,`Does every exit path from a session run the same cleanup, including the crash and suspend paths?`,`Are room codes namespaced per environment, and has someone tried to join across environments?`],
  test:[`Measure median and 95th percentile queue time by hour, together with how far the ladder had to relax. A short queue that always relaxes fully is a bad match served fast.`,`Suspend a client mid-match for five, thirty and three hundred seconds. Measure exactly what the player and the other players see at each, against the policy you wrote.`,`Run a load test that creates and abandons sessions on every exit path, then count allocated rooms afterwards. The number should return to zero.`],
  rel:[['server-stack-choices','Matchmaking is the service most often bought from a vendor, so the stack choice decides where its seam goes.'],['social-experience','Who you are matched with is the social experience, and a private room code is the whole feature for friends playing together.'],['return-and-quit','A queue that is too long or a match that is too one-sided is one of the most common reasons a player stops coming back.'],['server-scaling','Rooms are the unit that gets distributed, so the matchmaker and the shard layout are one design.'],['server-authority','The matcher hands players to something that becomes the authority, and which machine that is was decided by the authority model.'],['infra-deploy-models','A session is a stateful process with a lifetime, which is the hardest shape to deploy and the one that decides your platform.'],['multiplayer-design','Who should meet, and what counts as a fair match, is decided there before the queue is built.']],
  tech:[
    {n:'Ticket pool with rule predicates', how:`Every waiting party becomes a ticket with a capacity and a list of predicates. A matcher periodically scans open tickets for a set that satisfies everyone’s predicates and forms a match.`, fit:`Most games. It expresses skill, latency, mode and party rules uniformly.`, cost:`The scan is quadratic in the worst case and needs a lock or a single owner. Long-waiting tickets starve without an explicit ladder.`, alt:`First come first served into the next open room, which is fine when the only predicate is capacity.`},
    {n:'Private rooms with join codes', how:`One player creates a room and receives a short code. Others type it. The code is prefixed with an environment tag before becoming the session name.`, fit:`Friends playing together, playtests, tournaments, anything where the player chooses the company.`, cost:`Short codes collide and must be reserved and expired. Without an environment tag, builds sharing one service can cross over.`, alt:`Invite links, which remove typing and require a platform that can deliver them.`},
    {n:'Relay and lobby services', how:`A hosted service holds the session list, allocates a relay so neither peer needs a public address, and handles discovery and join.`, fit:`Host mode and peer topologies, small teams, platforms behind carrier-grade network address translation.`, cost:`A per-session and per-byte bill, a dependency on someone else’s availability, and limited control over placement.`, alt:`Dedicated servers you allocate yourself, which cost more to operate and give you the routing.`},
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
    pitfall:`Putting the node that handles the session inside the gameplay scene. The multiplayer_peer itself lives on the SceneTree’s MultiplayerAPI and survives a scene change, but loading the match scene frees the node that connected server_disconnected and any function suspended in an await on it, so a dropped server goes unnoticed and the join hangs; the symptom looks like a flaky server. The session owner belongs on an autoload or on a node explicitly kept across scene changes, with its lifetime tied to the session rather than to the level.`,
    map:`Godot’s HTTPRequest to your own matchmaker plus ENetMultiplayerPeer is what Unity’s Lobby and Relay services, or a Fusion NetworkRunner.StartGame call, package for you.` },
  unity:{ term:`With Photon Fusion, a third-party SDK rather than part of Unity, a NetworkRunner owns the session. You start it in host or client mode against a session name, and Photon’s lobby and relay handle discovery and traversal, so the room code is really a session name you construct. Unity’s own equivalent is the Sessions API in Multiplayer Services.`,
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
    pitfall:`Using the raw room code as the session name while development and production builds share one application id. A tester’s six-digit code can collide with a real player’s, and two builds that cannot understand each other end up in the same room. Prefix the code with a one-character environment tag before it becomes the session name, and never show that character to the player.`,
    map:`Unity’s StartGameArgs.SessionName is the session identity your Godot matchmaker would hand back next to the host and port.` },
  note:`The engine gives you joining. Matchmaking is the server’s ticket pool, its relaxation ladder and its disconnect policy, none of which live in the client. The one thing the client must get right is lifetime: the object holding the session survives scene loads, and every exit path tears the session down exactly once.` });
INTERVIEW('server-matchmaking',{
  junior:[
    { q:`What information does a matchmaking ticket need to carry?`,
      a:`Who’s waiting (including party size), the capacity the match needs, the predicates a candidate group must satisfy, and when it entered the queue. Say why the entry time matters: without it you can’t build a relaxation ladder or know who’s waited too long.`,
      follow:`What would you add to the ticket for a game with a skill rating?`,
      red:`Describes matchmaking as “the algorithm that finds two players” with no mention of what data it operates on.` },
    { q:`Why would a matchmaker deliberately widen its criteria the longer someone waits, instead of always matching strictly?`,
      a:`Strict predicates give a better match and a longer queue, so a fixed ladder trades match quality for wait time on purpose, on a schedule someone chose, rather than leaving players waiting indefinitely for a perfect match. Give an example: skill widens after some seconds, but mode never widens.`,
      follow:`Which predicate would you never widen, no matter how long someone’s waited, and why?`,
      red:`Treats wait time as something to minimise at all costs with no floor on match quality.` },
    { q:`What’s the difference between a public matchmaking queue and a private room with a join code?`,
      a:`A queue matches strangers by predicates; a private room lets a player choose their own company via a code. Say a real risk with room codes: they can collide, especially across a test build and a live build sharing infrastructure.`,
      follow:`How would you make a short room code safe to reuse across environments?`,
      red:`Cannot explain why a short join code needs an environment tag or expiry.` }
  ],
  mid:[
    { q:`Design the relaxation ladder for a game where a good match means similar skill and low latency. What would you write down?`,
      a:`A schedule: which predicate widens at which wait time, by how much, and which predicates never widen at all, expressed as data someone can read and change, not constants buried in the matcher. Say how you’d validate it: a queue report showing median wait alongside how far the ladder had to relax, so a short queue that always fully relaxes is visible as a bad-match problem, not a success.`,
      follow:`Your ladder widens skill but never latency, and players in one region complain about laggy matches. What do you change?`,
      red:`Builds a ladder with no visibility into how often it relaxes in production.` },
    { q:`Walk me through the full session lifecycle for a match, including every way it can end badly.`,
      a:`Created, players join, played, and ended by a graceful finish, a host leaving, a network drop, a crash, or the last player leaving. For each, name who tears the session down and what’s left allocated if that step is skipped. Say why the exit paths matter more than the happy path: an empty room that isn’t cleaned up costs money forever.`,
      follow:`Which of those exit paths is easiest to accidentally skip, and how would you catch it?`,
      red:`Describes only the happy-path lifecycle and treats cleanup as an afterthought.` },
    { q:`A player’s app is suspended for thirty seconds mid-match. What should happen, and who decides?`,
      a:`Say this is a genuine product decision, not just an engineering default: either the seat is held with a timeout and reconnect handshake, or the suspend is treated as session death immediately. Both are legitimate, but it has to be decided and written down, and the choice depends on platform and match length. Say which you’d pick for a short mobile match versus a long PC match.`,
      follow:`If you choose to hold the seat, what does the rest of the match see for those thirty seconds?`,
      red:`Assumes reconnection support is free to add later without pricing the state machine it needs.` }
  ],
  senior:[
    { q:`Queue times are short but players complain matches feel unbalanced. What’s your diagnosis process?`,
      a:`Look at the relaxation ladder’s actual behaviour in production, not its design intent: a short queue that always fully relaxes is a bad match served fast, which is exactly this symptom. Pull the queue report for relaxation depth by hour and correlate with complaint timing. Say what you’d change first: not the algorithm, the ladder’s schedule or the population’s arrival rate assumptions.`,
      follow:`The relaxation depth is fine during the day and terrible at 2am. What does that tell you, and what’s the actual fix?`,
      red:`Proposes tuning the matching algorithm itself before checking what the ladder is doing.` },
    { q:`You’re scaling matchmaking to a much larger population across regions. What breaks first, and how do you find out before it breaks in production?`,
      a:`Name the concrete risks: a matcher holding a lock across a network call, a shared ticket list that starves long-waiting tickets, and session placement that doesn’t account for regional latency. Say you’d load test with realistic arrival patterns and concurrent session creation, not synthetic requests per second, and instrument relaxation depth and wait distribution before the population grows.`,
      follow:`Load testing shows the matcher is fine under load but session creation is the bottleneck. Does that change your rollout plan?`,
      red:`Assumes the existing matcher scales linearly without load testing session creation and placement separately.` }
  ] });
DIAGRAM('server-matchmaking', { kind:'state', title:'A match ticket from queue to result', start:'queued',
  states:[{id:'queued', t:'Queued', d:'ticket waiting'},{id:'matched', t:'Matched', d:'rules satisfied'},{id:'room', t:'In room', d:'server allocated'},{id:'playing', t:'Playing', d:'match running'},{id:'reconnect', t:'Reconnecting', d:'grace window'},{id:'ended', t:'Ended', d:'result recorded'}],
  edges:[['queued','matched','rules met'],['matched','room','allocate'],['room','playing','all ready'],['playing','reconnect','drop'],['reconnect','playing','back in time'],['reconnect','ended','timeout'],['playing','ended','match over']] });

GO('server-matchmaking', {
  api:['sync.Mutex', 'time.Time.Sub', 'Duration.Seconds', 'builtin max', 'append'],
  snippet:`package mm

import (
	"sync"
	"time"
)

// maxBand is the hard cap: a long wait never makes a very unfair match.
const maxBand = 600

type Ticket struct {
	Player   string
	Rating   int
	QueuedAt time.Time
}

type Queue struct {
	mu      sync.Mutex
	tickets []Ticket
}

func (q *Queue) Add(t Ticket) {
	q.mu.Lock()
	defer q.mu.Unlock()
	q.tickets = append(q.tickets, t)
}

// Match pairs two tickets whose rating gap is inside a band. The band starts
// at 100 and widens by 25 for every second the longer-waiting player has waited,
// up to maxBand.
func (q *Queue) Match(now time.Time) (a, b Ticket, ok bool) {
	q.mu.Lock()
	defer q.mu.Unlock()
	for i := range q.tickets {
		for j := i + 1; j < len(q.tickets); j++ {
			x, y := q.tickets[i], q.tickets[j]
			waited := max(now.Sub(x.QueuedAt), now.Sub(y.QueuedAt))
			band := min(100+25*int(waited.Seconds()), maxBand)
			if abs(x.Rating-y.Rating) <= band {
				q.tickets = append(q.tickets[:j], q.tickets[j+1:]...)
				q.tickets = append(q.tickets[:i], q.tickets[i+1:]...)
				return x, y, true
			}
		}
	}
	return Ticket{}, Ticket{}, false
}

func abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}
`,
  pitfall:'Matching inside a fixed rating band. In a quiet hour a player at the edge of the population waits for ever. Widen the band with waiting time and keep a hard cap, as maxBand does here, so the match is still fair.'
});

EXPLAINER('server-matchmaking', { kind:'explainer', title:'One ticket from queue to match',
  frames:[
    { t:'The ticket enters the queue', spec:{ kind:'stack', layers:[{ t:'Ticket', d:'skill 1500, region EU' }, { t:'Search range', d:'plus or minus 50' }] } },
    { t:'No match yet: the range widens over time', d:'Fairness traded for wait time, a little every few seconds.', spec:{ kind:'curve', x:'Seconds waiting', y:'Skill range allowed', alt:'The allowed skill gap grows with the time spent waiting.', series:[{ t:'Range', pts:[[0,0.1],[0.3,0.2],[0.6,0.45],[1,0.8]] }] } },
    { t:'A match is proposed, then confirmed', spec:{ kind:'flow', steps:[{ id:'p', t:'Proposed' }, { id:'c', t:'All accept' }, { id:'s', t:'Server allocated' }, { id:'j', t:'Players join' }], edges:[['p','c'],['c','s'],['s','j']] } },
    { t:'Someone declines: back to the queue, keeping their place', spec:{ kind:'flow', steps:[{ id:'d', t:'One declines' }, { id:'q', t:'Others re-queue', d:'priority kept' }], edges:[['d','q']] } }
  ] });

T('server-scaling',{ d:'server', t:'Scaling a game server', tag:'Stateless parts scale by adding copies. The stateful parts are the whole problem.',
  what:`Making the server hold more concurrent players than one process can. The request-serving layer is stateless and scales by adding instances behind a load balancer. Rooms, sessions and live connections are stateful and must be placed somewhere findable, with a directory that maps a room to the instance holding it. Messages that must reach players spread across instances go through a pub/sub layer, usually sharded, and player data itself can be partitioned into independent worlds when a single database stops keeping up.`,
  why:[`A realtime game’s cost is dominated by concurrent connections and running sessions, not by requests per second.`,`Stateful instances cannot be replaced freely. Every deploy, crash and scale-down decision has to answer what happens to the sessions on that instance.`,`Fan-out is where an innocent feature becomes a cost. A message to a channel with ten thousand subscribers is ten thousand deliveries.`,`Partitioning changes the game’s design. Players in different worlds cannot see each other, and that is a product decision dressed as an infrastructure one.`],
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
  rel:[['server-stack-choices','Choosing hosting and orchestration comes before scaling it, and the choice decides how sessions are placed and drained.'],['live-operations','Capacity, deploys and drains are live operations work, and they are what a launch day consists of.'],['metrics-and-success','Concurrent sessions, fan-out volume and drain duration are the metrics that tell you whether the architecture is holding.'],['server-matchmaking','Where a room is placed and how it is found is the other half of the matchmaker.'],['server-realtime-protocol','Channels and op codes are the unit that fan-out is measured in.'],['infra-data-stores','Partitioning, replicas and queues are the storage side of the same scaling decision.']],
  tech:[
    {n:'Stateless request tier plus stateful session tier', how:`Two deployments. The request tier holds nothing between calls and scales by copies. The session tier owns live rooms and scales by placement and draining.`, fit:`Any game with both an out-of-match service and live matches.`, cost:`Two lifecycles, two deploy procedures, and a directory that maps rooms to instances.`, alt:`One process doing both, which is simpler and means every deploy kills every match.`},
    {n:'Sharded pub/sub fan-out', how:`Channels are distributed across nodes by a hash of the channel name. Each server instance subscribes on behalf of its connected clients, with reconnect and retry on node failure.`, fit:`Chat, presence, notifications and any message that must reach players spread across instances.`, cost:`Subscriber sets are spread, so counting or enumerating all subscribers of a channel becomes a fan-in. Node failure needs explicit re-subscription.`, alt:`A single node, which is simpler and has a hard ceiling you will reach without warning.`},
    {n:'World or shard partitioning', how:`An environment value selects both the configuration and the data location for a partition of players. The same code serves every partition and the partitions never share state.`, fit:`Large player populations, regional deployments, and games where meeting everyone is not the point.`, cost:`Cross-partition features must be built separately or given up. Moving a player between partitions is a migration.`, alt:`A single shared world with a database that has to keep up, which preserves the design and raises the storage problem.`},
    {n:'Capacity from master configuration', how:`Room size, rooms per instance, channel limits and rate ceilings are read from configuration at boot rather than compiled in.`, fit:`Live games where an event changes the shape of load faster than a release cycle.`, cost:`Configuration becomes a production surface with its own review and audit needs.`, alt:`Constants in code, which are safe from accidents and need a deploy for every adjustment.`}
  ] });
ENGINE('server-scaling',{
  godot:{ term:`The client’s share of scaling is routing and re-subscription. It asks a directory where its room lives instead of holding an address, and it treats every reconnect as a peer that has forgotten it.`,
    api:['HTTPRequest for the room directory call','WebSocketPeer.get_ready_state() / STATE_CLOSED','MultiplayerAPI.server_disconnected','Timer with exponential backoff','Array[String] of active channel names','ProjectSettings for the directory endpoint per build'],
    snippet:`extends Node                       # Net.send(op, body) wraps the protocol topic's send(op, id, body)

var _channels: Array[String] = []
var _last_seq := 0

func subscribe(ch: String) -> void:
\t_channels.append(ch)
\tNet.send(OP_SUBSCRIBE, ch)

func _on_socket_reopened() -> void:        # a shard restarted or we were moved
\tfor ch in _channels:
\t\tNet.send(OP_SUBSCRIBE, ch)         # the server did not remember you
\tNet.send(OP_RESYNC, str(_last_seq))    # ask for what was missed`,
    pitfall:`Caching the room’s host and port and reconnecting straight to it. Room placement moves when an instance drains or dies, so the cached address outlives the room and the player lands on a closed port or, worse, on an unrelated instance. Always re-ask the directory on reconnect and treat the address as valid only for the current connection.`,
    map:`Godot’s directory call plus manual re-subscription is what a managed relay service does invisibly in Unity, and the resync sequence number is your own version of a NetworkVariable’s initial state sync.` },
  unity:{ term:`The client resolves its shard through a route call and reopens against whatever endpoint comes back, replaying its subscriptions. Nothing about the topology is compiled into the build.`,
    api:['UnityWebRequest for the route call','ClientWebSocket.ConnectAsync(uri, ct)','Application.internetReachability','NetworkRunner.SessionInfo.Region','PlayerPrefs for the last-seen sequence only','CancellationTokenSource for teardown on route change'],
    snippet:`// socket.Send(op, body) is shorthand for the protocol topic's framed send(op, id, body)
public class ShardRouter : MonoBehaviour {
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
    pitfall:`Building region or shard selection into the client as a dropdown backed by constants. Every capacity change then needs a client release, and players on old builds keep connecting to instances you are trying to drain. Let the server decide placement and return it, and keep the client’s only knowledge the address of the directory itself.`,
    map:`Unity’s route call returning an endpoint is the same directory lookup a Godot client makes with HTTPRequest before creating its peer.` },
  note:`Scaling is a server topic and this is the client contract it depends on: never cache an endpoint, always re-subscribe after a reconnect, and carry a sequence number so the server can tell you what you missed. A client that assumes the server remembered it is the reason a shard restart looks like a total outage.` });
INTERVIEW('server-scaling',{
  junior:[
    { q:`Why can’t you scale a stateful game server the same way you scale a stateless API?`,
      a:`A stateless request handler holds nothing between calls, so adding a copy behind a load balancer just works. A room or session holds live state in one process, so a client has to find the specific instance holding it, and killing that instance kills the match. Give the concrete consequence: you need a directory that maps a room to its instance.`,
      follow:`What happens to a client if the instance holding its room disappears before it connects?`,
      red:`Proposes “just add more servers” without distinguishing stateless from stateful load.` },
    { q:`What is fan-out, and why can an innocent feature become an expensive one because of it?`,
      a:`Fan-out is the multiplication of one message into deliveries, one per subscriber. Give the concrete example: a message to a channel with ten thousand subscribers is ten thousand deliveries, so a channel granularity chosen without thinking about population size can turn a small feature into a load test you ship by accident.`,
      follow:`How would you redesign a channel that’s grown too large without breaking the feature it serves?`,
      red:`Describes fan-out as a networking detail with no cost implication.` },
    { q:`Why would a game split its player population into separate “worlds” or shards?`,
      a:`It multiplies capacity with unchanged code, because each partition runs the same system with its own resources. Say the real cost, and be honest that it’s a product decision, not just an infrastructure one: players in different partitions can’t see or play with each other unless you build something across the boundary.`,
      follow:`What feature would you have to build specially if two friends land in different worlds?`,
      red:`Treats partitioning as a purely technical scaling knob with no product consequence.` }
  ],
  mid:[
    { q:`How do you deploy a new server version without killing matches that are in progress?`,
      a:`Describe a drain: stop routing new sessions to an instance, wait for its existing sessions to end naturally within a window, then terminate it. Say what has to be decided explicitly: what happens to a session that outlasts the drain window, and how the room directory stays correct the whole time so no client is handed a dead address.`,
      follow:`A session is still running after the drain window expires. What are your actual options, and what would you pick?`,
      red:`Describes a deploy as “just restart the instances” with no mention of sessions in flight.` },
    { q:`Your pub/sub layer is sharded across nodes. What has to happen when one node restarts?`,
      a:`Subscriptions live on the node, so they don’t survive a restart automatically, meaning every affected client has to re-subscribe rather than assume the server remembered it. Say the failure mode if this isn’t handled: a client silently stops receiving messages with no error anywhere. Describe how you’d detect that in testing before players do.`,
      follow:`How would a client even know it needs to re-subscribe if the reconnect appears successful?`,
      red:`Assumes subscriptions survive a node restart without checking the actual library’s behaviour.` },
    { q:`How would you set capacity limits, like room size or connections per instance, so an event doesn’t require a release to adjust them?`,
      a:`Read them from configuration at boot rather than compiling them into the binary, so an operator can change them without shipping a build. Say the trade-off honestly: configuration becomes a production surface that now needs its own review and audit, which constants in code didn’t need.`,
      follow:`Who should be allowed to change that configuration, and how would you prevent an accidental change from taking down live matches?`,
      red:`Hardcodes capacity limits and treats every adjustment as requiring a full release.` }
  ],
  senior:[
    { q:`A live game is hitting a capacity ceiling during peak hours. Walk me through how you’d diagnose whether it’s the request tier, the session tier, or the pub/sub layer.`,
      a:`Separate the three by what they cost: measure concurrent sessions per instance versus request throughput versus fan-out volume independently, because they scale differently and a fix aimed at the wrong one wastes the outage. Say what a load test has to simulate to reveal the real ceiling: concurrent sessions, not requests per second. Name which of the three is usually cheapest to fix and why.`,
      follow:`The session tier is fine but a single pub/sub channel is saturating one node. What’s the actual fix, and what does it cost?`,
      red:`Proposes scaling everything uniformly without first isolating which tier is the bottleneck.` },
    { q:`You’re asked to partition a live game’s population into shards to unlock more capacity. What do you push back on before agreeing to build it?`,
      a:`Say plainly that this changes what the game is for players who end up separated, and that decision belongs to product, not infrastructure. Push for naming which features must still work across partitions, like friends lists or leaderboards, before any code is written, because those either get built specially or get given up, and both are real costs. Describe how you’d choose a partitioning key that avoids hot spots.`,
      follow:`Product wants cross-partition friends lists after all. What does that require, on top of the partitioning you already built?`,
      red:`Agrees to partition immediately as a purely technical task with no product conversation.` }
  ] });
DIAGRAM('server-scaling', { kind:'matrix', title:'Stateless parts add copies; stateful parts are the problem',
  rows:['Gateways and APIs','Matchmaking','Game rooms','Chat and presence'], cols:['State held','How it scales'],
  cells:[['None','Add copies behind a load balancer'],['Queues of tickets','Partition by region or mode'],['Live match state in memory','A directory maps each room to a server'],['Open connections','Pub/sub fan-out across servers']] });

GO('server-scaling', {
  api:['atomic.Bool', 'http.Error', 'http.StatusServiceUnavailable', 'http.HandlerFunc'],
  snippet:`package drain

import (
	"net/http"
	"sync/atomic"
)

type Gate struct{ draining atomic.Bool }

// StartDrain is called when the instance is told to stop, for example on SIGTERM.
func (g *Gate) StartDrain() { g.draining.Store(true) }

// Ready is the readiness probe: the load balancer stops sending new players.
func (g *Gate) Ready(w http.ResponseWriter, r *http.Request) {
	if g.draining.Load() {
		http.Error(w, "draining", http.StatusServiceUnavailable)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// NewGames refuses new rooms while draining. Rooms already running finish.
func (g *Gate) NewGames(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if g.draining.Load() {
			http.Error(w, "draining", http.StatusServiceUnavailable)
			return
		}
		next.ServeHTTP(w, r)
	})
}
`,
  pitfall:'Exiting as soon as SIGTERM arrives, which kills live matches. Mark the instance not ready, wait until the rooms empty or a deadline passes, and set the platform grace period at least that long.'
});

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
       no:[`Decide who gets banned. That is a policy judgement with an appeal path and a person who owns it.`,`Set thresholds from intuition. Thresholds come from the distribution of your honest players.`,`Promise that a client-side measure is secure. Nothing running on the player’s machine is.`] },
  prompts:[{l:'Threat pass',p:`Here are the messages our client can send and the fields in each: [MESSAGES]. Acting as an attacker with full control of the client, list what you would claim for each message, ordered by advantage gained. For each, state the server-side check that would catch it, and mark the ones where no server-side check is possible without changing who decides the outcome.`},
    {l:'Evidence and ladder',p:`Our detection is [MECHANISM] and it fires on [SIGNAL]. Design the evidence record a human reviewer would need a week later, the retention period and the reason for it, and a response ladder from first detection to removal. For each rung say what the player experiences, what it teaches a cheater about our detection, and who owns the decision to apply it.`}],
  verify:[`Is every input bounded before any work is done on it, including the ones that look harmless?`,`Does the evidence record contain enough for a reviewer who was not there, and does it avoid storing anything it should not?`,`Are the current thresholds derived from the honest-player distribution, and when were they last checked against it?`],
  test:[`Write a client that submits impossible values on every field and measure which ones the server accepts. Any acceptance is a finding, not a test failure.`,`Measure the false positive rate of each detection against a known-honest cohort before turning any enforcement on.`,`Measure how long evidence is retained against how long it takes the team to notice and review a new cheat. If retention is shorter, it is not evidence.`],
  rel:[['ethics-and-responsibility','Bans, shadow bans and retained evidence are decisions about people, with the same duty of care as any other data practice.'],['readable-and-fair-ai','Fairness the player can verify is the same problem on the design side. A loss they cannot explain reads as cheating whether or not it was.'],['server-determinism','Re-simulation is the strongest detection available, and it collapses the moment parity is not proven.'],['server-authority','Moving a decision to the authority prevents a whole class of cheating that no detector would have to catch.'],['backend-observability','Action logs, aggregates and retained replays are observability infrastructure being used as evidence.']],
  tech:[
    {n:'Server re-simulation', how:`The server re-runs the submitted run from the seed and inputs and compares its own result with the claim, accepting only an exact match.`, fit:`Any content where the client simulates and the result matters: runs, races, time trials, solo challenges.`, cost:`Requires proven determinism and server time proportional to the run. Inputs must be bounded or the check is a denial of service.`, alt:`Plausibility bounds on the result alone, far cheaper and only catches the obvious.`},
    {n:'Bounds and rate gates', how:`Every field has a physically possible range and every action a maximum rate. Violations are rejected before any work happens.`, fit:`The first line everywhere, including on messages you do not think are worth protecting.`, cost:`Bounds drift out of date as the game is balanced, so they need an owner and a test.`, alt:`Checking after the fact in aggregates, which catches it later and lets the cheat land first.`},
    {n:'Aggregate and outlier detection', how:`Batch jobs look across time for shapes a single event cannot show: improvement curves, win streaks, submission frequency, results without a matching session.`, fit:`Catching sophisticated cheating and abuse that is legal per message and illegitimate in pattern.`, cost:`Produces suspicion, never proof. Needs a human decision layer and a false positive budget.`, alt:`Per-event rules, which are certain and only see what one message contains.`},
    {n:'Shadow enforcement', how:`A detected account keeps playing with its effects contained: results discarded, matched only with similar accounts, leaderboard entries hidden from everyone else.`, fit:`Buying time to observe a new cheat, and reducing the speed at which cheaters iterate against your detection.`, cost:`Runs a second class of service you must keep working. A false positive is invisible to the player and therefore never appealed.`, alt:`Immediate rejection, which is honest, appealable, and tells the cheater exactly what you detect.`}
  ] });
ENGINE('server-anticheat',{
  godot:{ term:`On the client side the useful work is refusing to be the authority. Every gameplay RPC entry point is an untrusted boundary, and the sender id is the only identity you may believe.`,
    api:['MultiplayerAPI.get_remote_sender_id()','@rpc("any_peer", "call_remote", "reliable")','SceneMultiplayer.auth_callback / auth_timeout','PackedByteArray size checks before decoding','Crypto.hmac_digest() (only catches accidental corruption: a key shipped in the client is not a secret)','OS.has_feature("debug") to keep debug paths out of release'],
    snippet:`@rpc("any_peer", "call_remote", "reliable")
func submit_run(run_seed: int, inputs: PackedInt32Array, claimed: String) -> void:
\tif not multiplayer.is_server(): return
\tvar who := multiplayer.get_remote_sender_id()
\tif inputs.size() > MAX_INPUTS: return               # bound before you simulate
\tvar trace := Sim.new().run(run_seed, inputs)
\tvar actual := trace.to_byte_array().hex_encode().sha256_text()   # a hash the Go server can compute
\tif actual != claimed:
\t\tReplays.keep(who, run_seed, inputs, claimed, actual) # evidence, not a ban
\t\treturn
\tScores.commit(who, actual)`,
    pitfall:`Shipping the debug and cheat helpers that made development bearable. A Godot export includes every script in the project, so a console command that grants currency is in the release build whether or not any UI reaches it. Gate them behind OS.has_feature(“debug”) at the definition, not at the call site, and check an export build for what is still reachable.`,
    map:`Godot’s get_remote_sender_id() is Unity’s ServerRpcParams.Receive.SenderClientId, and both are the only identity in the message you are allowed to trust.` },
  unity:{ term:`The client side is ownership discipline plus build hygiene. ServerRpc with required ownership fixes who may call, the sender id fixes who called, and the obfuscation configuration decides whether the netcode still works on device.`,
    api:['[ServerRpc(RequireOwnership = true)]','ServerRpcParams.Receive.SenderClientId','[Obfuscation(Exclude = true)] (or your obfuscator’s own exclusion) on weaved network types','Conditional("UNITY_EDITOR") on debug helpers','NetworkManager.DisconnectClient(clientId)','Application.genuineCheckAvailable'],
    snippet:`[System.Reflection.Obfuscation(Exclude = true)]   // honoured by most .NET obfuscators; the weaver resolves members by name
public class RunSubmit : NetworkBehaviour {

    [ServerRpc(RequireOwnership = true)]
    void SubmitServerRpc(int seed, int[] inputs, long claimed,
                         ServerRpcParams p = default) {
        if (inputs.Length > MaxInputs) return;          // bound before simulating
        long actual = Sim.Hash(Sim.Run(seed, inputs));
        ulong who = p.Receive.SenderClientId;
        if (actual != claimed) { Replays.Keep(who, seed, inputs, claimed, actual); return; }
        Scores.Commit(who, actual);
    }
}`,
    pitfall:`Turning on name obfuscation without excluding the network types. Netcode weavers and serialisers resolve members by name at runtime, so renaming them breaks remote player registration on a device build while the editor, which does not obfuscate, keeps working. The bug looks like a network fault and is a build configuration fault. Mark the weaved classes excluded and put a device smoke test in the pipeline.`,
    map:`Unity’s [ServerRpc(RequireOwnership = true)] is Godot’s @rpc(“any_peer”) plus an explicit is_server() and sender check.` },
  note:`Nothing on this tab is anti-cheat. It is the client not making the server’s job impossible: one trusted identity per message, bounded payloads, no debug affordances in the release build, and a build configuration that does not quietly break the netcode. Detection, evidence and enforcement all live on the server.` });
INTERVIEW('server-anticheat',{
  junior:[
    { q:`Why can’t you trust a result the client computed, even if the client used the exact formula the server would use?`,
      a:`Checking a submitted result against a formula the client also computed only verifies your own arithmetic against itself, it says nothing about whether the client ran the play it claims to have run. Give the concrete fix: re-simulate independently from the seed and inputs, or bound the value against what’s physically possible.`,
      follow:`What would make you confident a value really is physically bounded rather than just usually bounded?`,
      red:`Believes validating a result against a client-supplied formula is sufficient anti-cheat.` },
    { q:`What’s the difference between preventing a cheat and detecting one?`,
      a:`Prevention is the authority model refusing to accept an assertion in the first place, so the cheat is structurally impossible. Detection is noticing after the fact that a claim doesn’t hold up, which means the player experienced some advantage in the meantime, however briefly. Say which is cheaper when it’s available.`,
      follow:`Give an example of something that can only be detected, never prevented, and why.`,
      red:`Uses “prevention” and “detection” interchangeably.` },
    { q:`Why does a detection system need to keep evidence, not just log that something suspicious happened?`,
      a:`A ban without retained evidence can’t be justified or appealed, which is worse than not banning at all, because it costs trust with a possibly innocent player. Say what belongs in the record: the submission, the inputs, the claimed result, the computed result, and the player, retained long enough for a human to review it.`,
      follow:`How long should that evidence be kept, and what decides the answer?`,
      red:`Treats a log line saying “flagged as suspicious” as sufficient evidence for a ban.` }
  ],
  mid:[
    { q:`Design the input validation for a message where a client submits a match result. What do you check, and in what order?`,
      a:`Bound every field first, length, range, rate, how far in the past a timestamp can be, and reject outside the bound before spending any work on it. Then, if the client simulated the play, re-simulate on the server from the seed and inputs and accept only an exact match. Say why order matters: an unbounded input handed straight to simulation is a denial-of-service dressed as a cheat check.`,
      follow:`A field has no natural physical limit, like a currency amount in an unbounded economy. How do you check it instead?`,
      red:`Re-simulates or deeply processes a submission before doing any cheap bounds checking on it.` },
    { q:`You detect a likely cheater. What decides whether they get banned immediately, rate limited, or shadow banned?`,
      a:`Say plainly that this is a policy decision owned by a person, not a threshold that fires an automatic action, because the response teaches the cheater something about your detection every time it’s visible. Describe the trade-off: immediate rejection is honest and appealable but reveals exactly what you caught; shadow enforcement buys time to observe but risks an invisible, unappealable false positive.`,
      follow:`How would a falsely flagged honest player ever find out and get it reversed under shadow enforcement?`,
      red:`Automates the ban decision directly off a single detection signal with no human review step.` },
    { q:`How would you set the threshold for flagging an outlier, like an implausible improvement curve?`,
      a:`From the actual distribution of your honest player base, not from intuition, because the best honest player in the world can look statistically identical to a mild cheat. Say how you’d validate a proposed threshold: measure its false positive rate against a known-honest cohort before turning on any enforcement tied to it.`,
      follow:`Your honest player distribution shifts after a balance patch. What does that do to a threshold you set six months ago?`,
      red:`Sets a threshold once from a gut feeling and never revisits it against real player data.` }
  ],
  senior:[
    { q:`You’re told the game has almost no active cheating reports. Is that reassuring? What do you check?`,
      a:`No, treat it skeptically: it could mean detection works, or it could mean nobody’s looking and the first anyone will hear of a cheat is a video of it. Check whether there’s active monitoring producing a denominator, not just a numerator of reports, and whether any bounds or re-simulation checks exist on the highest-value actions. Say what you’d instrument first.`,
      follow:`You find bounds exist but haven’t been updated since a major balance patch six months ago. What does that risk?`,
      red:`Accepts a low report count at face value as proof the game is clean.` },
    { q:`Design the anti-cheat approach for a new competitive mode from scratch, end to end.`,
      a:`Start from the authority table: everything the client currently decides is a detection problem, and the cheapest anti-cheat is moving that decision to the server first. Bound every remaining input. Where the client simulates, re-simulate and accept only exact matches, which requires proven determinism as a precondition. Build the evidence record and retention policy before enabling any enforcement, and separate detection, which writes a record, from response, which is a policy decision. Name the order you’d build these in and why that order.`,
      follow:`Server re-simulation for this mode requires proven determinism, and the simulation isn’t deterministic yet. What does that do to your plan?`,
      red:`Proposes enforcement mechanisms before the detection and evidence layers exist.` }
  ] });

GO('server-anticheat', {
  api:['sync.Mutex', 'time.Time.Sub', 'Duration.Seconds', 'builtin min'],
  snippet:`package cheat

import (
	"sync"
	"time"
)

// Bucket is a token bucket: rate actions a second, bursts up to burst.
type Bucket struct {
	mu     sync.Mutex
	tokens float64
	last   time.Time
	rate   float64
	burst  float64
}

func NewBucket(rate, burst float64, now time.Time) *Bucket {
	return &Bucket{tokens: burst, last: now, rate: rate, burst: burst}
}

// Allow takes the server's clock, never a timestamp sent by the client.
func (b *Bucket) Allow(now time.Time) bool {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.tokens = min(b.burst, b.tokens+now.Sub(b.last).Seconds()*b.rate)
	b.last = now
	if b.tokens < 1 {
		return false
	}
	b.tokens--
	return true
}
`,
  pitfall:'Banning on the first rejected action. A lag spike can send a burst of honest inputs. Count rejections, flag the account for review, and keep bans for patterns that repeat.'
});

DIAGRAM('server-anticheat', { kind:'flow', title:'Where each check lives', steps:[
  { id:'c', t:'Client', d:'sends intent, not results' }, { id:'v', t:'Server validates', d:'rate, range, cooldown' }, { id:'s', t:'Authoritative state' }, { id:'l', t:'Logs and review', d:'patterns over time' }],
  edges:[['c','v','input'],['v','s','accepted'],['v','l','flagged']] });

T('server-liveops',{ d:'server', t:'Live operations on the server', tag:'The game keeps running while you change it. Gates, versions and scheduled jobs are how you stay in control.',
  what:`The server-side machinery that lets a live game be changed without breaking the players inside it. A maintenance gate that can close the game before a risky change, a client-version gate that can force an update while still letting a few endpoints answer, versioned master data that clients download rather than ship, scheduled batch jobs that do the work no request can do, and an order of operations for releases that keeps data, server and client compatible at every moment in between.`,
  why:[`A live game has no maintenance window you did not create, so the gate has to be a feature, not an emergency.`,`Clients update slowly and unevenly. The server will be talking to several versions of the game at once whether or not you planned for it.`,`Balance that ships as data instead of as a build turns a week-long release into a same-day change.`,`Batch jobs are where seasons end, rewards are granted and stale state is swept, and a batch that silently fails is discovered by players.`],
  think:{ q:[`Which endpoints must keep working while the game is closed for maintenance, and why exactly those?`,`What is the oldest client version we will still serve, and what does an older one see?`,`Does this change need a new client, or can it ship as data to the clients already installed?`,`In what order do the data change, the server release and the client release have to land, and is every intermediate state valid?`,`If this batch does not run tonight, who notices, and how?`],
    trade:[`Forcing an update guarantees one client version and locks out everyone who cannot update right now.`,`Data-driven content ships fast and lets anyone change the game without review, which is the same sentence.`,`A full maintenance window is the safest way to make a risky change and it is also the most visible failure a live game can show.`],
    traps:[`Putting the version check after the handler that needs it, so the endpoint that tells the client to update is itself blocked.`,`Shipping master data that references content the installed client does not have. The data version and the client version are one compatibility question.`,`Writing a batch with no record of whether it ran, so a missed night is invisible until the numbers are wrong.`,`A deploy order that requires the client and server to land simultaneously. There is no simultaneous.`,`Testing maintenance mode only by enabling it, never by having a player in a session when it turns on.`],
    good:[`Maintenance and force-update can be switched on from configuration, and someone has practised it.`,`Every batch job has a documented schedule, a record of its last successful run, and a stated recovery if it is missed.`],
    bad:[`Changing a drop rate requires a client release.`,`The team has never seen what an out-of-date client does.`] },
  how:[`Put the maintenance gate and the version gate in the request path before anything else, with an explicit allow list of paths that must still answer, and keep that list short and reviewed.`,`Carry the client version, the master data version and the resource version on every request so the server always knows what it is talking to.`,`Ship balance and content as versioned master data the client downloads at boot, and validate it against the client versions that will receive it before publishing.`,`Define the release order once and always follow it: data that is backward compatible first, server second, client last. Every intermediate state must be a state the live game can sit in.`,`Give every batch a header that states its schedule, whether it is scheduled or manual recovery only, and what happens if it is skipped. Record each run and alert on a missed one.`,`Make batches idempotent and re-runnable, because the day you need to re-run one is the day it already half finished.`,`Keep a rollback for each part. Data can be republished at the previous version, the server can be redeployed, the client cannot be recalled.`,`Practise the whole procedure on a non-live environment, including closing the game with players inside it.`],
  ai:{ yes:[`Draft the release order for a change that touches data, server and client, and list what breaks in each intermediate state.`,`Review a maintenance gate’s allow list for endpoints that would leave a client stuck.`,`Write the batch header block: schedule, trigger, idempotency, what a skipped run costs, how to recover it.`,`Generate a compatibility matrix of client versions against master data versions from a described change.`],
       no:[`Decide to close the game. That is an operational and business call with a cost per minute.`,`Choose the minimum supported client version. It locks out real players.`,`Judge whether a data change is safe for installed clients without seeing what those clients do with it.`] },
  prompts:[{l:'Release order',p:`We are shipping a change that touches [DATA CHANGE], [SERVER CHANGE] and [CLIENT CHANGE]. Produce the ordered release plan and, for every intermediate state between steps, say which combination of versions is live and whether the game still works for a player sitting in it. Mark any step that cannot be rolled back and propose how to make it reversible.`},
    {l:'Batch job spec',p:`This job does [WHAT] and is expected to run [SCHEDULE]. Write its header block: exact schedule, whether it is scheduled or manual recovery only, what it reads and writes, why it is safe to run twice, what happens if it is skipped for one cycle and for a week, and the alert that should fire if it does not complete. Then list the failure modes that would leave data half written.`}],
  verify:[`Is the maintenance allow list short, reviewed, and does it include the path that tells a client to update?`,`Does every batch record its last successful run somewhere a person can see?`,`Has the release order been followed in a rehearsal, with a player in a session when the gate closed?`],
  test:[`Enable maintenance mode with live sessions running in a test environment. Measure what those players see, whether the client recovers on retry, and how long the whole close takes.`,`Run the previous client build against the current server. Measure exactly what the player is shown, and whether they can reach the update prompt.`,`Skip a batch deliberately in a test environment and measure how long it takes for anything to alert. If nothing alerts, the job is unmonitored.`],
  tech:[
    {n:'Maintenance gate with an allow list', how:`A switch in configuration, checked in the request path before any handler, that answers every path except a short reviewed list with a maintenance response.`, fit:`Any risky data, schema or server change on a game with players in sessions.`, cost:`The most visible failure a live game can show, and a wrong allow list strands clients on a screen with no way out.`, alt:`A rolling deploy with backward compatible changes, so no gate is needed.`},
    {n:'Client version gate with force update', how:`Every request carries the client version. The server compares it with the minimum supported version, compared as parsed numbers rather than as strings, and answers the update prompt path even to blocked clients.`, fit:`When an old client cannot safely talk to the current server or master data.`, cost:`Locks out anyone who cannot update right now, so the minimum must be a business decision.`, alt:`Keep serving old versions through a compatibility layer, at the cost of carrying it.`},
    {n:'Versioned master data', how:`Balance and content ship as data with a version. The client downloads it at boot, and the server validates it against the client versions that will receive it.`, fit:`Drop rates, prices, event schedules: anything that should change without a client release.`, cost:`Anyone who can edit it can break the game, and data that references content the installed client lacks is a compatibility break.`, alt:`Ship the values in the build, which is safe and slow.`},
    {n:'Idempotent scheduled jobs with a run record', how:`Each batch (season end, reward grant, sweep) has a stated schedule, is safe to run twice, and writes the time of its last successful run where a person and an alert can see it.`, fit:`Any work no request triggers: seasons, rewards, cleanup.`, cost:`Needs a run table, an alert and a documented recovery for every job.`, alt:`A manual runbook step, which is fine for rare jobs and fails silently for nightly ones.`}],
  rel:[['live-operations','This is the server half of the live-operations plan, and the two are the same calendar.'],['metrics-and-success','A live change is only a change if you can see its effect, which means the measurement exists before the release.'],['server-scaling','Deploys, drains and capacity are the operations the gates are protecting.'],['backend-migrations-config','Schema migrations and environment configuration are the other half of the release order.'],['pm-liveops-cadence','The cadence decides how often this machinery runs, and machinery that runs rarely is machinery nobody trusts.']] });
ENGINE('server-liveops',{
  godot:{ term:`The boot sequence is the client’s live-operations surface. Before any gameplay scene loads, one call decides whether the game is open, whether this build may still play, and which master data version to fetch.`,
    api:['HTTPRequest.request() at boot, before change_scene_to_file()','ProjectSettings.get_setting("application/config/version")','SceneTree.change_scene_to_file()','ResourceLoader.load_threaded_request() for downloaded data','FileAccess / user:// for the cached master payload','OS.shell_open() for the store page'],
    snippet:`func _on_boot_response(body: Dictionary) -> void:
\tif _older(APP_VERSION, body.min_client_version):   # numeric compare: "1.9.0" < "1.10.0"
\t\tUi.force_update(body.store_url)         # no path past this screen
\t\treturn
\tif body.maintenance_until > 0:
\t\tUi.maintenance(body.message, body.maintenance_until)
\t\treturn
\tif body.master_version != Master.loaded_version:
\t\tawait Master.download(body.master_version)   # data first, scene second
\tget_tree().change_scene_to_file("res://scenes/home.tscn")

func _older(a: String, b: String) -> bool:     # string comparison would sort "1.10.0" below "1.9.0"
\tvar pa := a.split(".")
\tvar pb := b.split(".")
\tfor i in maxi(pa.size(), pb.size()):
\t\tvar x := int(pa[i]) if i < pa.size() else 0
\t\tvar y := int(pb[i]) if i < pb.size() else 0
\t\tif x != y:
\t\t\treturn x < y
\treturn false`,
    pitfall:`Loading the home scene first and checking the gates afterwards, because the boot call is asynchronous and the scene change is not. The player reaches a screen built from stale master data, then gets thrown out of it, and any request they fired in between is already rejected. Gate before the first scene change, and keep the boot scene able to display maintenance and update messages on its own.`,
    map:`Godot’s boot HTTPRequest before change_scene_to_file is Unity’s boot await before SceneManager.LoadScene, and Master.download is Addressables.UpdateCatalogs.` },
  unity:{ term:`A boot scene runs the gate call, then the content catalogue check, then loads the first real scene. Version comes from the build, catalogue state from the remote content system.`,
    api:['UnityWebRequest at boot','Application.version','Addressables.UpdateCatalogs() / CheckForCatalogUpdates()','Addressables.LoadContentCatalogAsync()','SceneManager.LoadSceneAsync()','Application.OpenURL() for the store page'],
    snippet:`async Task Boot() {
    var gate = await Api.Post<BootResponse>("/boot");
    if (new Version(gate.MinClientVersion) > new Version(Application.version)) { Ui.ForceUpdate(gate.StoreUrl); return; }
    if (gate.MaintenanceUntil > 0) { Ui.Maintenance(gate.Message, gate.MaintenanceUntil); return; }

    if (gate.CatalogHash != PlayerPrefs.GetString("catalog")) {
        var check = Addressables.CheckForCatalogUpdates(false);
        await check.Task;
        if (check.Result.Count > 0) await Addressables.UpdateCatalogs(check.Result, false).Task;
        PlayerPrefs.SetString("catalog", gate.CatalogHash);   // only after it succeeded
    }
    await SceneManager.LoadSceneAsync("Home");
}`,
    pitfall:`Writing the new catalogue hash to preferences before the catalogue update has completed. An interrupted download then leaves the client believing it holds content it never fetched, and every missing address fails at the point of use, far from the cause. Record the version only after the update succeeds, and make a failed update fall back to the previous catalogue rather than to an empty one.`,
    map:`Unity’s Addressables catalogue version is the master data version in Godot, and Application.version is the client version the server gates on.` },
  note:`Live operations happens on the server and is felt at the client’s boot sequence. The contract is small and rigid: send the client version and the data version on every request, obey the gates before touching content, and never advance a stored version number until the thing it describes is really on disk.` });
INTERVIEW('server-liveops',{
  junior:[
    { q:`Why does a live game need a maintenance gate as a designed feature, instead of just being able to take the servers down when needed?`,
      a:`Say plainly that a live game has no maintenance window that wasn’t deliberately built, so without a gate, “taking the servers down” means an uncontrolled failure players experience as a crash. A real gate lets you close the game in a controlled way, show a message, and decide exactly which endpoints, like the update prompt, still answer.`,
      follow:`What’s the one endpoint that must never be blocked by the maintenance gate, and why?`,
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
    { q:`You’re shipping a change that touches the database schema, the server, and the client. What order do you release them in, and why?`,
      a:`Backward-compatible data change first, server second, client last, because every intermediate combination of versions has to remain a state the live game can sit in for however long that rollout takes. Say what you’d check at each step: does the old client still work against the new server, does the new server still work against the old data shape.`,
      follow:`The client change can’t be made backward compatible with the current server. What does that force you to do differently?`,
      red:`Plans to deploy data, server and client “at the same time” without acknowledging there’s no such thing as simultaneous.` },
    { q:`A nightly batch job that grants rewards silently failed last night. How should the team have found out before players did?`,
      a:`Say what should already exist: every batch records its last successful run somewhere visible, and a missed run triggers an alert rather than a silent gap. Describe the fix for this incident and the process fix: add the missing monitoring, and make the job idempotent and re-runnable so recovering from a missed night doesn’t risk double-granting rewards.`,
      follow:`Why does idempotency matter specifically for the recovery, not just for the normal run?`,
      red:`Proposes just re-running the job manually without addressing why nothing alerted in the first place.` },
    { q:`How would you test that your maintenance mode works before you need it for a real risky change?`,
      a:`Enable it in a test environment with real live sessions running, not an empty one, and measure exactly what those players see, whether they can still reach the update or maintenance screen, and how long the full close takes. Say why testing only by flipping the switch with nobody connected misses the actual failure mode.`,
      follow:`A player is mid-transaction when maintenance mode engages in your test. What happens to that transaction?`,
      red:`Has only ever tested maintenance mode with no players connected.` }
  ],
  senior:[
    { q:`Your team wants to move faster on live balance changes. What would you change, and what would you refuse to change?`,
      a:`Push towards versioned master data the client already knows how to fetch, validated against the client versions that will receive it before publishing, so most changes skip the build pipeline entirely. Refuse to skip the compatibility check between data version and client version just to move faster, because that’s the exact gap that ships broken references to content an installed client doesn’t have.`,
      follow:`How would you validate a new data version against every client version still in the field before publishing it?`,
      red:`Proposes removing the data-to-client compatibility check as the way to increase release velocity.` },
    { q:`Design the release rehearsal process for a live game before a major version bump that touches data, server, and client.`,
      a:`Run the full ordered release in a non-live environment with real, connected sessions, including deliberately closing the game with players inside it and confirming the maintenance and version gates behave as designed at every intermediate state. Include the rollback path for each layer, and be explicit that the client can’t be recalled once it’s out, which constrains what “rollback” even means for that layer.`,
      follow:`The rehearsal reveals a state between server and client where the game doesn’t work correctly. What do you do with the release?`,
      red:`Treats rehearsal as a formality and ships without ever exercising an intermediate state with real players connected.` }
  ] });

GO('server-liveops', {
  api:['atomic.Pointer', 'json.Unmarshal', 'fmt.Errorf %w'],
  snippet:`package liveops

import (
	"encoding/json"
	"fmt"
	"sync/atomic"
)

type Flags struct{ cur atomic.Pointer[map[string]bool] }

// Load parses a new set of flags and swaps it in whole, with no restart.
func (f *Flags) Load(raw []byte) error {
	m := map[string]bool{}
	if err := json.Unmarshal(raw, &m); err != nil {
		return fmt.Errorf("parse flags: %w", err)
	}
	f.cur.Store(&m)
	return nil
}

// On is false for a flag that is missing, so a bad config fails closed.
func (f *Flags) On(name string) bool {
	m := f.cur.Load()
	return m != nil && (*m)[name]
}
`,
  pitfall:'Editing the stored map in place while handlers read it, which is a data race that can crash the process. Build a new map and swap the pointer, as here.'
});

T('server-rollback-netcode',{ d:'server', t:'Rollback netcode and lockstep', tag:'Guess the other player’s input, keep playing, and when the guess is wrong, go back and replay the frames.',
  what:`Two ways for peers to share one simulation by sending only inputs. Deterministic lockstep waits: no peer advances a frame until every player’s input for that frame has arrived, so latency becomes delay. Rollback (the GGPO approach) guesses: it predicts the missing remote input, usually by repeating the last one, runs the frame at once, and when the real input arrives and differs it restores a saved state and re-simulates the frames since. Both need a simulation that gives the same result on every machine from the same inputs. Rollback also needs the whole game state to be saved, loaded and stepped many times inside one rendered frame.`,
  why:[`Delay-based play adds the round trip to every button press. In a fighting game a few frames of input delay change what you can punish, and it varies with each opponent’s connection.`,`Sending inputs instead of state keeps bandwidth tiny and independent of unit count. That is why lockstep suits strategy games with thousands of units.`,`Rollback keeps your own inputs instant. Only the opponent’s moves are ever corrected, and only by a few frames.`,`Both fail hard on a desync. One machine differs by one bit and the two matches drift apart with no error message.`],
  think:{ q:[`Can I save, load and step the whole game state fast enough to re-run up to N frames inside one frame of wall time?`,`Is the simulation deterministic across every platform I ship, or only on one build?`,`What is the input, in bits? Rollback and lockstep both live or die on inputs being small and quantised.`,`How many frames of rollback do I allow before I stall and wait instead?`,`What should the player see when a rollback changes the past: an instant pose change, a blend, a re-triggered sound?`],
    trade:[`Lockstep is simpler and never shows a wrong frame. It runs at the pace of the slowest peer and turns any bad connection into input delay for everyone.`,`Rollback feels responsive and is much more work. Every system, including animation, particles, audio triggers and physics, must be either inside the saved state or safely re-runnable.`,`A small fixed input delay (1 to 3 frames) plus rollback reduces how often the past changes, at the price of a little latency. Tune it per game.`,`Client-server with prediction (see server-authority) scales to many players and needs a server. Rollback suits 2 to 4 players, peer to peer.`],
    traps:[`Putting gameplay state outside the snapshot. A cooldown in a UI script or a random number in an effect does not roll back, so replays diverge.`,`Triggering sounds, hit stop or screen shake from inside the re-simulated frames, so they fire again on every replay.`,`Using wall-clock time, frame delta or the engine’s global random inside the simulation. Rollback needs the same fixed step and a seeded generator as any deterministic sim.`,`Predicting an input that can never be repeated safely, such as a single-frame command, and then acting on the guess as if it were real.`,`Allowing unlimited rollback. A peer 20 frames behind must trigger a stall or a disconnect, not a 20-frame replay every tick.`],
    good:[`The game can save a state, load it, step it, and produce a checksum. A replay of recorded inputs gives the same checksum on both peers every time.`,`A run of matches with injected 100 ms latency, jitter and packet loss ends with zero desyncs.`],
    bad:[`Desyncs are blamed on the network.`,`Rollback was added at the end of production to a game whose state is spread across many scripts and nodes.`] },
  how:[`Make the simulation a pure function: next_state = step(state, inputs), with a fixed step, a seeded random source and no reads from the clock, the renderer or the network. See server-determinism.`,`Keep all gameplay state in one place that can be copied cheaply: a struct or a set of packed arrays. Anything that affects the next frame goes in it.`,`Each frame: read local input, send it (with the last few inputs repeated in each packet, so a lost packet costs nothing), save the state, predict the remote input, and step.`,`When a remote input arrives for a past frame, compare it to what you predicted. If equal, do nothing. If different, load the saved state for that frame and step forward to the present using the corrected input, then render once.`,`Separate simulation from presentation. Effects, sound and camera read the state; they do not change it. Trigger them only from frames that are confirmed or that have not been shown before.`,`Cap the rollback window (for example 8 frames). If a peer is farther behind, stall the simulation until it catches up, or drop the connection.`,`Exchange a checksum of the state every few frames. On a mismatch, log both states for that frame. That is the only reliable way to find a desync.`,`For lockstep, skip the prediction and the snapshots: wait for all inputs for frame N plus your input delay before stepping. Add a playout buffer to absorb jitter.`],
  ai:{ yes:[`Turn a list of your game’s state variables into a snapshot struct and list the ones that live outside it.`,`Write the checksum and desync-report code, including the first differing frame and field.`,`Review a step function for hidden non-determinism: clock reads, unordered iteration, shared random sources.`,`Simulate the input timeline for two peers at a stated latency and count how many rollbacks and of how many frames it produces.`],
       no:[`Say a game is rollback-ready. Only a two-machine soak test with latency and loss says that.`,`Choose the input delay or the rollback cap. Those are feel decisions, tuned by playing.`,`Decide how a correction should look. That is a game feel and animation call.`] },
  prompts:[{l:'Find state outside the snapshot',p:`Here is our fighting game’s per-frame update code and the list of what our snapshot struct saves: [PASTE]. List everything the update reads or writes that is not in the snapshot, everything that changes gameplay and is outside it, and every side effect (sound, particle, camera) that would fire again if a frame were re-run.`},
    {l:'Rollback plan',p:`We have a [GENRE] game for [PLAYERS] players on [PLATFORMS]. A frame simulates in [MS] ms. Estimate the largest number of frames we can re-simulate inside one rendered frame at 60 Hz, propose an input delay and a rollback cap, and say what the game does when the cap is exceeded. State your assumptions about the state size.`}],
  verify:[`Does the snapshot include every value the next frame depends on, and nothing else?`,`Do two peers produce the same state checksum on the same frame under injected latency and loss?`,`Do effects and sounds fire once per event, not once per replay?`],
  test:[`Record a match’s inputs. Replay them twice on each platform and compare a checksum of the state every frame. A single mismatch is a determinism bug.`,`Run two builds against each other through a network simulator at 100 ms latency, 30 ms jitter and 5 percent packet loss for an hour. Count desyncs and rollbacks longer than 4 frames.`,`Force a rollback of the maximum length every frame and measure the frame time. If it misses the budget, the state is too big or the step too slow for the cap.`],
  facts:[{claim:`The GGPO README describes rollback as input prediction plus speculative execution: player inputs go to the game immediately.`,asOf:'2026-09-30',src:'https://github.com/pond3r/ggpo'},
    {claim:`The GGPO developer guide requires the game to implement save_game_state, load_game_state and advance_frame callbacks.`,asOf:'2026-09-30',src:'https://github.com/pond3r/ggpo/blob/master/doc/DeveloperGuide.md'},
    {claim:`Fiedler’s deterministic lockstep article: send only inputs, not state; the simulation must match to the bit across machines; a playout delay buffer absorbs jitter; and sending recent inputs redundantly in each UDP packet beats retransmission.`,asOf:'2026-09-30',src:'https://gafferongames.com/post/deterministic_lockstep/'}],
  tech:[
    {n:'Delay-based lockstep', how:`Peers exchange inputs and step frame N only when every input for frame N is in. A fixed input delay hides small latency.`, fit:`Real-time strategy and games with thousands of units, where state is too big to send.`, cost:`Every peer runs at the pace of the slowest. A bad connection becomes input delay for all.`, alt:`Rollback, when 2 to 4 players need instant local controls.`},
    {n:'Rollback with prediction', how:`Predict missing remote input, step at once, and re-simulate from a saved state when the real input differs. A small input delay lowers how often it happens.`, fit:`Fighting games and other two-player, tight-timing games where every frame of delay is felt.`, cost:`The whole state must be cheap to save and load, and effects must be separated from the simulation. Debugging desyncs is slow.`, alt:`Client-server prediction, when you already run authoritative servers.`}
  ],
  rel:[['server-determinism','Both lockstep and rollback are only possible if the simulation is bit-exact on every peer.'],['server-authority','Lockstep and rollback are authority models with no server: every peer holds the truth and inputs are the only thing sent.'],['server-state-sync','Rollback replaces state snapshots with input exchange; the interpolation and prediction ideas come from the same family.'],['game-feel-and-juice','A rollback changes the past on screen; how that looks is a feel decision.']] });
ENGINE('server-rollback-netcode',{
  godot:{ term:`Godot has no built-in rollback. You keep your own state dictionary, step it from _physics_process at the fixed tick, and never let the engine physics or random generator run the simulation. Use a seeded RandomNumberGenerator and integer or carefully controlled maths.`,
    api:['Node._physics_process(delta)','Engine.physics_ticks_per_second','RandomNumberGenerator.seed','Dictionary.duplicate(true)','PackedByteArray','hash()'],
    snippet:`extends Node
const MAX_ROLLBACK := 8
var frame := 0
var pos := Vector2.ZERO            # stand-in for the whole game state
var local_in := {}                 # frame -> int
var remote_in := {}                # frame -> int, predicted or real
var real := {}                     # frame -> true once confirmed
var snaps := {}                    # frame -> saved state

func step(bits: int) -> void:
    local_in[frame] = bits
    snaps[frame] = pos
    if not remote_in.has(frame):
        remote_in[frame] = remote_in.get(frame - 1, 0)   # predict: repeat last
    _advance(bits, remote_in[frame])
    frame += 1

func on_remote(f: int, bits: int) -> void:
    var wrong: bool = remote_in.get(f, bits) != bits
    remote_in[f] = bits
    real[f] = true
    if not wrong or f >= frame or frame - f > MAX_ROLLBACK:
        return
    var now := frame
    pos = snaps[f]
    for g in range(f, now):
        snaps[g] = pos
        if not real.has(g) and g > f:
            remote_in[g] = remote_in[g - 1]
        _advance(local_in[g], remote_in[g])

func _advance(l: int, r: int) -> void:
    pos.x += (l & 1) - (r & 1)`,
    pitfall:`Storing the snapshot as a reference. Vector2 is a value type so the line above is safe, but a Dictionary or Array saved into snaps is shared, not copied, and later steps silently change your history. Call duplicate(true) when the state holds containers. Also never call the frame step from _process: a variable frame rate breaks determinism.`,
    map:`The Godot dictionaries of frame to state play the role of Unity’s ring buffers, and _physics_process at a fixed tick is the equivalent of driving Step from a FixedUpdate-style accumulator.` },
  unity:{ term:`Unity has no rollback layer either. Keep the state in a blittable struct so saving is a copy, store snapshots in a ring buffer indexed by frame, and drive the step from your own fixed accumulator, not from Update. Avoid UnityEngine.Random and the built-in physics inside the simulated state.`,
    api:['struct copy semantics','System.Array.Fill','Time.fixedDeltaTime','System.Random with a seed','Unity.Collections.NativeArray<T>','Physics.simulationMode'],
    snippet:`using UnityEngine;
public class Rollback : MonoBehaviour {
    const int Max = 8, Ring = 64;
    struct State { public Vector2 pos; }   // whole game state
    readonly State[] snaps = new State[Ring];
    readonly int[] local = new int[Ring], remote = new int[Ring], conf = new int[Ring];
    State cur; int frame;
    void Awake() { System.Array.Fill(conf, -1); }

    public void Step(int bits) {
        int i = frame % Ring;
        local[i] = bits; snaps[i] = cur;
        if (conf[i] != frame) remote[i] = remote[(frame + Ring - 1) % Ring];  // predict
        cur = Advance(cur, bits, remote[i]); frame++;
    }
    public void OnRemote(int f, int bits) {
        if (f < frame - Max || f >= frame - Max + Ring) return;   // guard first: keeps slots unique
        int i = f % Ring; bool wrong = f < frame && remote[i] != bits;   // future: nothing to fix
        remote[i] = bits; conf[i] = f;      // a future input is stored; Step will use it
        if (!wrong) return;
        int now = frame; cur = snaps[i];
        for (int g = f; g < now; g++) {
            int k = g % Ring; snaps[k] = cur;
            if (conf[k] != g && g > f) remote[k] = remote[(g + Ring - 1) % Ring];
            cur = Advance(cur, local[k], remote[k]);
        }
    }
    static State Advance(State s, int l, int r) { s.pos.x += (l & 1) - (r & 1); return s; }
}`,
    pitfall:`Using a ring buffer with no guard on how old or how far ahead a frame can be. If the ring holds 64 frames and a late input claims frame 10 when you are on frame 90, f % Ring points at a newer frame’s data. The range test, with Max well under Ring, must run before any read of the buffer. Do not drop inputs for frames not yet simulated: with input delay they are normal, and storing them means Step never has to predict that frame.`,
    map:`The Unity struct and ring buffer are the Godot dictionaries of frame to state; State copy on assignment is what duplicate(true) does in Godot for containers.` },
  note:`Neither engine provides rollback, so the first job is not code but a boundary: gameplay state you can copy, and a step you can call many times. The snippets show the whole idea with a one-value state. A real game replaces pos with every value the next frame depends on.` });
INTERVIEW('server-rollback-netcode',{
  junior:[
    { q:`What is the difference between delay-based netcode and rollback netcode, from the player’s side?`,
      a:`Delay-based waits for the other player’s input and so adds the network delay to your own buttons. Rollback runs your input at once, guesses the other player’s input, and if the guess was wrong, quietly re-plays the last few frames. You feel your own controls instantly and only see the opponent’s moves corrected by a few frames.`,
      follow:`When does a rollback become visible to the player?`,
      red:`Says rollback removes latency. It hides it and moves the cost into corrections.` },
    { q:`What does a rollback game have to be able to do with its state?`,
      a:`Save it, load it and step it, quickly, many times within one frame. Everything that affects the next frame must be in the saved state.`,
      follow:`Give one example of state that people forget.`,
      red:`Cannot say what the saved state should contain.` }
  ],
  mid:[
    { q:`A rollback game shows a sound twice for one hit. What happened and how do you fix it?`,
      a:`The frame that made the sound was re-simulated. Effects were fired from inside the step. Fix: keep the simulation pure, and fire presentation from a layer that reads confirmed events, or that remembers which event ids it already played.`,
      follow:`What about a sound that started on a wrong prediction?`,
      red:`Suppresses the duplicate with a timer rather than by event identity.` },
    { q:`Two players see different match results. How do you find the cause?`,
      a:`A desync. Exchange a checksum of the state every few frames, log both full states at the first mismatching frame, and diff them. Then look for non-determinism: clock reads, unordered iteration, global random, floating point differences across platforms.`,
      follow:`Why is the first differing frame more useful than the last?`,
      red:`Suggests better network code as the fix.` },
    { q:`How would you choose the input delay and the rollback cap?`,
      a:`Input delay of 1 to 3 frames reduces how often the past changes. The cap comes from the step cost: the maximum number of frames you can re-simulate inside the frame budget. Beyond it, stall or disconnect. Both are tuned by play, on real bad connections.`,
      follow:`What do you show a player whose peer exceeds the cap?`,
      red:`Picks numbers with no measurement of step time.` }
  ],
  senior:[
    { q:`Your team wants rollback in a game that is nearly finished. What is your assessment?`,
      a:`Check the three preconditions first: deterministic simulation, gameplay state that can be copied as a unit, and presentation separate from simulation. If gameplay state is spread over many nodes and scripts and physics is the engine’s, it is a re-architecture, not a feature. Offer a smaller version: lockstep with input delay for two players, or client-server prediction.`,
      follow:`How would you prove the estimate before committing?`,
      red:`Says it is a plugin to add at the end.` },
    { q:`When do you choose lockstep, rollback or client-server prediction?`,
      a:`Lockstep for many units where state is too big to send and latency tolerance is high. Rollback for two to four players where every frame of delay is felt and you cannot afford servers. Client-server prediction for many players, hidden information or ranked play where an authority is needed. Name the deciding constraint.`,
      follow:`What breaks first as you add players to rollback?`,
      red:`Treats one model as best for all.` }
  ] });

GO('server-rollback-netcode', {
  api:['array indexing with modulo', 'struct copy'],
  snippet:`package rollback

const window = 8

// State must hold everything the step reads, so a replay gives the same result.
type State struct{ Frame, X int }

type Game struct {
	cur   State
	saved [window]State
}

func step(s State, input int) State {
	return State{Frame: s.Frame + 1, X: s.X + input}
}

// Advance saves the state before the frame, then simulates it.
func (g *Game) Advance(input int) {
	g.saved[g.cur.Frame%window] = g.cur
	g.cur = step(g.cur, input)
}

// Rollback restores the state at the start of frame and replays the
// corrected inputs for frame and every frame after it.
func (g *Game) Rollback(frame int, inputs []int) bool {
	if frame < 0 || frame >= g.cur.Frame || frame < g.cur.Frame-window {
		return false
	}
	g.cur = g.saved[frame%window]
	for _, in := range inputs {
		g.Advance(in)
	}
	return true
}
`,
  pitfall:'Letting the step read something that is not in the saved state, such as time.Now, a shared map or a pointer to another object. The replay then differs from the first run and the players drift apart.'
});

EXPLAINER('server-rollback-netcode', { kind:'explainer', title:'Rollback: predict, correct, catch up',
  note:'Frames run at 60 per second. One frame of a fighting game is about 16.7 ms; a 100 ms round trip means the other player\'s input arrives about 3 frames late.',
  frames:[
    { t:'Frame 10: both games run with no wait', d:'Each machine runs frame 10 at once with its own player\'s input and a guess for the other player: their last input, repeated.',
      spec:{ kind:'stack', layers:[{ t:'My input', d:'pressed: block' }, { t:'Their input', d:'guessed: still walking' }, { t:'Simulate frame 10', d:'draw it now' }] } },
    { t:'Frame 13: the real input for frame 10 arrives', d:'It says they attacked on frame 10. The guess was wrong, so frames 10 to 13 on screen are wrong too.',
      spec:{ kind:'stack', layers:[{ t:'Real input, frame 10', d:'attack, not walk' }, { t:'Frames 10 to 13', d:'were drawn on a wrong guess' }, { t:'Saved state of frame 9', d:'kept for this' }] } },
    { t:'Roll back to frame 9 and re-run 10 to 13 in one tick', d:'Load the saved state, re-simulate four frames with the corrected input, and draw only the result.',
      spec:{ kind:'flow', steps:[{ id:'l', t:'Load frame 9' }, { id:'a', t:'Re-run 10', d:'real input' }, { id:'b', t:'Re-run 11 to 13', d:'same tick' }, { id:'d', t:'Draw frame 13', d:'corrected' }], edges:[['l','a'],['a','b'],['b','d']] } },
    { t:'The cost: a jump on screen, and four simulations in one frame', d:'The player may see a hit appear a few frames late. The simulation must be fast enough to run several times per frame and fully deterministic.',
      spec:{ kind:'matrix', rows:['What players see','What the code pays'], cols:['Rollback','Delay-based'], cells:[['a small correction','steady but laggy input'],['N re-simulations a frame','waiting for input']] } },
    { t:'Lockstep instead: wait for every input before running a frame', d:'Nothing is ever wrong, but every frame waits for the slowest input, so the delay is felt on every press.',
      spec:{ kind:'flow', steps:[{ id:'w', t:'Wait for all inputs' }, { id:'s', t:'Simulate frame' }, { id:'n', t:'Next frame' }], edges:[['w','s'],['s','n']] } }
  ] });

T('server-stack-choices',{ d:'server', t:'Choosing a multiplayer stack: hosting, services and netcode', tag:'Pick the session model first. Then pick three layers separately, and keep a seam so any one of them can be replaced.',
  what:`A multiplayer stack is three layers that are often sold together and should be chosen apart. The netcode library lives in the client and the server and moves state and messages between them (Netcode for GameObjects, Mirror, Photon Fusion 2, Fish-Net, or Godot’s high-level multiplayer). Orchestration and hosting start, place and stop dedicated server processes on machines (Agones on Kubernetes, Amazon GameLift Servers, PlayFab Multiplayer Servers). Backend services hold what lives between matches: accounts, matchmaking, leaderboards and storage (Nakama, PlayFab, Unity Gaming Services). Which of these you need depends first on the session model: short matches that start and end, or a persistent world that keeps running.`,
  why:[`A choice made for the demo is usually a choice made for life. The netcode library shapes every gameplay script, so replacing it late means rewriting the game.`,`Services end. Companies shut products down, rename them and change prices, and the date is theirs, not yours.`,`A match-based game and a persistent world need different hosting. Starting and stopping thousands of short processes is a different job from keeping one world alive.`,`Buying saves months at the start and costs a dependency. Building costs months and removes one. Neither is free, so the decision should be written down with its exit cost.`],
  think:{ q:[`Is a session a match that ends, or a world that stays? How many players share it, and how long does it last?`,`Which layers do we need at all? A co-op game for four friends may need a netcode library and nothing else.`,`For each product we name: what do we lose if it shuts down in a year, and how long would leaving take?`,`Where is the line between our game code and the vendor’s SDK, and could we move that line in a week?`,`What is the smallest build that proves the stack can carry our session model with real latency?`],
    trade:[`A managed service starts fast and ties your monthly bill to someone else’s price list and your roadmap to their shutdown risk.`,`Self-hosted open source (Agones, Nakama) gives control and exit options, and gives you the on-call rota.`,`A full-featured netcode library saves months of work and wraps your gameplay code in its types and attributes.`],
    traps:[`Choosing hosting before the session model, then discovering the product is built for the other kind.`,`Calling the vendor SDK from gameplay scripts, so leaving means touching every file.`,`Reading a free tier as a price. It is a promotion with a limit.`,`Comparing features on a landing page and never running a build under 150 ms of latency.`,`Treating one product as all three layers, so a hosting problem forces a netcode change.`],
    good:[`The three layers are named, each with an owner and an exit plan.`,`A thin interface of your own sits between gameplay code and each vendor.`],
    bad:[`The stack was picked because a tutorial used it.`,`Nobody can say what happens if the hosting provider shuts down next quarter.`] },
  how:[`Write the session model in one paragraph: match-based or persistent, player count, session length, and whether cheating matters. Everything else follows from it.`,`List the three layers and mark each one: not needed, build, or buy. A small co-op game can stop after the first.`,`Pick the netcode library first, because it is the hardest to replace. Read how it handles authority, and check it fits your server model from the authority topic.`,`Choose hosting and orchestration next. For match-based games, ask how fast a server starts, how it is told to stop, and who pays for idle capacity.`,`Add backend services last, one at a time, and only when a feature needs them. Accounts and matchmaking are the usual first two.`,`Put each vendor behind an interface you own, such as IMatchmaker or IServerAllocator. The vendor code sits in one folder and nothing else imports it.`,`Prototype the riskiest layer first: two clients and one dedicated server on a remote machine, with latency added, running one real match end to end.`,`Write the exit plan in the same document as the choice: what it would take to leave, and what you would replace it with.`],
  ai:{ yes:[`Draft a comparison table for options you name, with the columns you give it, then check every cell against the vendor’s own documentation.`,`Review your vendor-facing interfaces for places where a vendor type leaks into gameplay code.`,`Write the glue and the local test harness that starts a server and two clients.`,`List the questions to ask a vendor about limits, regions, data export and shutdown terms.`],
       no:[`Tell you what a product costs or whether it still exists today. These change, and a model’s memory of them is old.`,`Decide your build-or-buy line. That depends on your team, budget and risk appetite.`,`Replace a latency test on real networks.`] },
  prompts:[{l:'Three-layer plan',p:`Our game: [GAME]. Session model: [MATCH OR PERSISTENT], [PLAYERS] players, sessions of about [LENGTH]. Team: [TEAM SIZE AND SKILLS]. For each of netcode library, orchestration and hosting, and backend services, say whether we need it, and give two options with what we gain and what leaving would cost. Mark every claim about pricing, licence or availability as "check the vendor page".`},
    {l:'Seam review',p:`Here is the code that calls [VENDOR SDK]: [CODE]. List every place where a vendor type, attribute or callback is used outside one folder. For each, propose an interface of our own and show the smallest change that moves the vendor call behind it.`}],
  verify:[`Does each layer have a written exit plan?`,`Is every vendor call inside one folder, with nothing in gameplay code importing it?`,`Has a real match run on a remote dedicated server with added latency?`,`Does every claim about price, licence or shutdown date have a source and a date?`],
  test:[`Run one full match on a remote server with 100 to 200 ms of added latency and record what the player sees at each step: connect, play, disconnect, reconnect.`,`Replace the vendor behind one interface with a stub and see how many files change. The number is your lock-in.`,`Kill the allocated server mid-match and watch what the players and the backend do.`],
  rel:[['server-framework-landscape','The layer choice decides build or buy; the framework map compares what each library does once you buy.'],['server-scaling','Once the stack is chosen, scaling is how the stateful session tier grows and drains on that hosting.'],['server-matchmaking','Matchmaking is the service that most often comes from a vendor, so its interface is the first seam to draw.'],['server-authority','The authority model decides what the netcode library must support before you compare libraries.'],['infra-data-stores','Backend storage and its exit cost belong to the same build-or-buy decision.'],['live-operations','Hosting, deploys and shutdown notices are live operations work from launch day.']],
  tech:[
    {n:'Dedicated servers on managed hosting', how:`A hosting service starts your server build on demand, places a match on it and stops it when the match ends.`, fit:`Match-based games where fairness matters and you want fast scale-up.`, cost:`Per-use bills, a vendor dependency, and your server build must fit its lifecycle calls.`, alt:`Self-hosted orchestration, which gives control and gives you the operations work.`},
    {n:'Self-hosted orchestration', how:`You run the scheduler yourself, for example Agones on Kubernetes, and your server process reports ready, allocated and shutdown.`, fit:`Teams with platform skills who want control of cost and an easy exit.`, cost:`Someone must run and patch the cluster, and watch it at night.`, alt:`Managed hosting, which trades control for speed.`},
    {n:'Listen server or peer host', how:`One player’s game acts as the server. No hosting layer is needed.`, fit:`Small co-op games and prototypes where cheating is not a worry.`, cost:`The host’s connection and machine set the quality, and the session ends if the host leaves.`, alt:`A dedicated server, which costs money and removes the host advantage.`},
    {n:'Backend-as-a-service', how:`One product supplies accounts, storage, matchmaking and leaderboards through an SDK.`, fit:`Small teams that need services this month.`, cost:`Your data model and calls follow the product, so leaving means a migration.`, alt:`An open-source backend you run (Nakama), or your own service behind your own interface.`}
  ] });
ENGINE('server-stack-choices',{
  godot:{ term:`Godot’s high-level multiplayer API is built in, so the netcode layer costs nothing to adopt. A dedicated server is a headless export that creates an ENetMultiplayerPeer in server mode and waits for clients.`,
    api:['ENetMultiplayerPeer.create_server(port, max_clients)','ENetMultiplayerPeer.create_client(address, port)','multiplayer.multiplayer_peer','MultiplayerSpawner','@rpc("any_peer", "reliable")','OS.has_feature("dedicated_server")'],
    snippet:`extends Node

const PORT := 7777
const MAX_PLAYERS := 8

func _ready() -> void:
\tif OS.has_feature("dedicated_server"):
\t\tvar peer := ENetMultiplayerPeer.new()
\t\tpeer.create_server(PORT, MAX_PLAYERS)
\t\tmultiplayer.multiplayer_peer = peer
\t\tmultiplayer.peer_connected.connect(_on_peer_joined)

func _on_peer_joined(id: int) -> void:
\tprint("client joined: ", id)       # spawn its player here`,
    pitfall:`Letting scene scripts call a vendor service directly, such as a matchmaking SDK in a menu button. Put the call behind one autoload with methods like find_match() so the vendor can change without touching scenes. The built-in peer also has no hosting layer: you must start the headless build on a machine yourself or through an orchestrator.`,
    map:`Godot’s built-in API is the netcode layer only. Hosting and backend services are still your choice, as with Netcode for GameObjects in Unity.` },
  unity:{ term:`Netcode for GameObjects is a netcode library. NetworkManager.StartServer runs a dedicated server, StartHost runs a listen server, and StartClient joins one. Hosting and services are separate choices.`,
    api:['NetworkManager.Singleton.StartServer()','NetworkManager.Singleton.StartHost()','NetworkManager.Singleton.StartClient()','UnityTransport.SetConnectionData(address, port)','NetworkManager.OnClientConnectedCallback','Application.isBatchMode'],
    snippet:`public class Boot : MonoBehaviour {
    [SerializeField] ushort port = 7777;

    void Start() {
        var nm = NetworkManager.Singleton;
        var transport = nm.GetComponent<UnityTransport>();
        transport.SetConnectionData("0.0.0.0", port);

        if (Application.isBatchMode) {       // dedicated server build
            nm.OnClientConnectedCallback += id => Debug.Log("joined " + id);
            nm.StartServer();
        }
    }
}`,
    pitfall:`Calling a services SDK from gameplay scripts. Write an interface such as IMatchmaker and keep the vendor class in one folder, so a shutdown or a price change is a one-folder change. Check that a dedicated server build with no graphics still starts and accepts a client before you choose a host.`,
    map:`StartServer here is Godot’s headless ENetMultiplayerPeer server. Both only provide the netcode layer.` },
  note:`This topic is a decision, so the code is only the smallest dedicated server each engine offers. The part that matters is the seam you draw around everything else.` });
INTERVIEW('server-stack-choices',{
  junior:[
    { q:`What are the three layers of a multiplayer stack?`,
      a:`The netcode library, which moves state between client and server. Orchestration and hosting, which start and stop dedicated servers. Backend services, which hold accounts, matchmaking, leaderboards and storage. Say that they can be chosen separately.`,
      follow:`Which of the three does a four-player co-op game need?`,
      red:`Treats multiplayer as one product to pick.` },
    { q:`What is a dedicated server and how is it different from a listen server?`,
      a:`A dedicated server is a separate process that only runs the game. A listen server is a player’s own game also acting as the server. Dedicated gives fairness and stability and costs hosting. Listen is free and depends on the host’s connection.`,
      follow:`What happens to a listen-server match when the host quits?`,
      red:`Says dedicated is always better.` }
  ],
  mid:[
    { q:`How do you decide between a managed hosting service and running your own orchestration?`,
      a:`Start from the session model, team skills and budget. Managed is faster and bills per use, with a vendor dependency. Self-hosted such as Agones on Kubernetes gives control and an easy exit, and someone must run the cluster. Mention the cost of idle capacity in both.`,
      follow:`What would make you switch later?`,
      red:`Chooses on the price page alone.` },
    { q:`What is a seam and where would you put one?`,
      a:`An interface you own between gameplay code and a vendor SDK, such as IMatchmaker. All vendor code sits behind it in one folder. Then a shutdown or a price change means rewriting one adapter, not the game.`,
      follow:`How would you test that the seam holds?`,
      red:`Calls the SDK straight from gameplay scripts because it is faster to write.` },
    { q:`Why match the hosting to the session model?`,
      a:`Match-based games start and stop many short server processes, so start time and idle cost matter. Persistent worlds keep a process alive for a long time, so state, saving and upgrades matter. A product built for one fits the other badly.`,
      follow:`Which kind is a battle royale?`,
      red:`Sees no difference between them.` }
  ],
  senior:[
    { q:`A vendor you depend on announces a shutdown in six months. What do you do?`,
      a:`Read the notice for dates and data export. Find where the vendor code lives and how big it is. Pick a replacement or a self-hosted option and prove it on a prototype before committing. Migrate behind the seam, in stages, and tell the team the plan. Say what you would have done earlier: a written exit plan.`,
      follow:`What would you have to migrate that the SDK does not export?`,
      red:`Plans to wait and see, or to rewrite everything at once.` },
    { q:`How do you decide build or buy for a backend service?`,
      a:`Count the full cost: the months to build, the on-call to run it, and the exit cost of buying. Buy what is not your differentiator and easy to leave. Build what the game depends on or what you cannot afford to lose. Prototype the riskiest piece first. Mark every price or availability claim with a date.`,
      follow:`What would change your answer in two years?`,
      red:`Says always build, or always buy.` },
    { q:`What do you test before picking a stack?`,
      a:`One real match on a remote dedicated server with added latency, from connect to disconnect and reconnect. Add the vendor behind an interface and swap it with a stub to measure lock-in. Kill the server mid-match to see what players and the backend do.`,
      follow:`What result would make you reject the option?`,
      red:`Decides from feature lists and demos.` }
  ] });
FACTS('server-stack-choices',[
  { claim:`Unity’s Multiplay Game Server Hosting was deprecated on 1 April 2026, after a 31 March cut-off. From then customers could not scale new game servers or make new allocations, and customers who asked to move to Multiplay by Rocket Science could keep using it until their migration finished.`, asOf:'2026-10-01', src:'https://status.unity.com/info_notices/362941' },
  { claim:`Amazon GameLift Servers is AWS’s managed service for deploying, operating and scaling dedicated game servers for session-based multiplayer games, and includes FlexMatch matchmaking. It also offers Anywhere fleets, which run on your own hardware or another cloud.`, asOf:'2026-10-01', src:'https://docs.aws.amazon.com/gameliftservers/latest/developerguide/gamelift-intro.html' },
  { claim:`Agones is an open-source platform that scales and orchestrates dedicated multiplayer game servers on anything that runs Kubernetes.`, asOf:'2026-10-01', src:'https://agones.dev' },
  { claim:`Nakama is an open-source game backend. Its server framework lets you write runtime code in Go, JavaScript or Lua.`, asOf:'2026-10-01', src:'https://heroiclabs.com/docs/nakama/server-framework/introduction/' },
  { claim:`Mirror, an open-source networking library for Unity, is MIT licensed.`, asOf:'2026-10-01', src:'https://github.com/MirrorNetworking/Mirror' }
]);

GO('server-stack-choices', {
  api:['interface', 'chan', 'select', 'context.Context.Done'],
  snippet:`package netstack

import "context"

// Transport is the only thing game code knows about the network stack.
// A vendor library lives behind it, in one package.
type Transport interface {
	Send(ctx context.Context, peer string, msg []byte) error
	Receive(ctx context.Context) (peer string, msg []byte, err error)
}

type packet struct {
	peer string
	msg  []byte
}

// Loopback is an in-process Transport for tests and local play.
type Loopback struct{ ch chan packet }

var _ Transport = (*Loopback)(nil)

func NewLoopback() *Loopback { return &Loopback{ch: make(chan packet, 64)} }

func (l *Loopback) Send(ctx context.Context, peer string, msg []byte) error {
	select {
	case l.ch <- packet{peer: peer, msg: msg}:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func (l *Loopback) Receive(ctx context.Context) (string, []byte, error) {
	select {
	case p := <-l.ch:
		return p.peer, p.msg, nil
	case <-ctx.Done():
		return "", nil, ctx.Err()
	}
}
`,
  pitfall:'Passing the vendor library types through game code, so changing the stack later means rewriting everything. Keep the interface small and in terms of your own types.'
});

T('server-bandwidth-and-interest-management',{ d:'server', t:'Bandwidth and interest management', tag:'Bandwidth is players times things they can see times bytes times rate. Cut every term, and the cheapest cut is not sending it at all.',
  what:`How many bytes the server sends each client each second, and the four levers that set that number. Interest management decides which entities a client hears about at all. Priority and update rate decide how often each one is sent. Delta compression decides how much of its state is sent, by encoding it against a baseline the client has acknowledged. Quantisation and bit packing decide how many bits each remaining field costs. The budget is a hard number per client, and the sender fills each packet to it in priority order instead of hoping the state fits. The same budget has an upstream half, the client's inputs, which is small, and a CPU half, the cost of deciding what to send, which is what breaks first at scale.`,
  why:[`Cost grows with the square of the crowd. If every player is sent every other player, 100 players is 9,900 entity updates per tick and 10,000 players is about 100 million. No amount of tuning the bytes rescues that. Only sending less does.`,`The limit is not only your server bill. A packet over about 1,200 bytes risks fragmentation, and a fragmented packet is lost if any fragment is lost. One packet per tick caps a client at roughly 36 kB per second at 30 Hz, so the budget is real before the connection is.`,`Mobile players pay for the bytes. A game that streams 256 kbit/s uses about 115 MB an hour. At 20 kbit/s it uses about 9 MB. That gap decides whether a session is acceptable on a metered plan.`,`Interest management is also an anti-cheat measure. A client that is never told where the enemy is behind a wall cannot be modified to draw it. Mirror’s documentation lists cheating prevention as one of its three reasons for the feature.`,`Upstream and downstream are asymmetric. A client sends its own inputs, about 10 bytes at 30 Hz (an illustrative size), roughly 9 kbit/s with headers. It receives the world: 20 visible entities at 6 bytes is about 35 kbit/s with headers, and a crowd many times that. Consumer links are often asymmetric too, so the downstream number is the one that fills.`,`At 10,000 players in one shard the per-client budget does not change, because a client still sees only its capped set, but server egress does: 10,000 clients at 64 kbit/s is 640 Mbit/s, and at 256 kbit/s it is 2.56 Gbit/s. Splitting the world across servers is the topic on partitioning, not this one. Within one server the levers here still apply, and the crowd cap becomes the main one.`],
  think:{ q:[`What is the largest number of entities one client could legitimately need to hear about at once, and what do we send when a crowd exceeds it?`,`Which fields of each entity change every tick, and which change once a minute? Are they in the same message?`,`What precision does the player actually perceive for this field, at this distance, on this screen?`,`How does the sender know the client holds the baseline it is encoding against?`,`When the budget runs out mid-packet, which entities go missing, and does anyone notice?`,`What does the server do per client per tick to decide what to send, and how does that cost scale with the population?`],
    trade:[`Tight quantisation saves bits and puts a visible grid under slow movement. Loose quantisation costs bandwidth for precision nobody sees. The fix is per-field ranges chosen from the map, not one global format.`,`Delta compression against an acknowledged baseline survives packet loss and costs the server a stored history per client. Delta against the last packet sent is cheaper to store and corrupts the client when a packet is lost.`,`A small interest radius saves the most and makes an enemy pop into view as the radius edge is crossed. A large radius is smooth and costs nearly what no filter costs.`,`Lower update rates for far entities save bandwidth and make distant motion jerky. Interpolation hides it and adds latency to exactly the entities the player cannot judge.`,`Dormancy removes idle objects from per-tick consideration, and the price is that waking one must be an explicit call. Forgetting that call is a silent bug: the object changes on the server and the client never hears.`],
    traps:[`Quantising to a precision chosen at a desk and never checking it at the edges of the map. Float32 holds 24 bits of precision, so resolution is fine near the origin and coarse far from it. A fixed-point grid has the same step everywhere.`,`Encoding the delta against the previous packet sent rather than the last one acknowledged. After one lost packet the client applies a delta to the wrong base and drifts.`,`Measuring bandwidth on a quiet test map. The first real crowd is the number, and it arrives at launch.`,`Putting all players in one global relevant set because the filter was “almost working”. The set grows with the population and nobody notices until the first big event.`,`Rebuilding the interest set every tick for every client with an all-pairs distance check. That is the part that is quadratic in CPU, and it fails before the network does.`,`Counting payload bytes and forgetting 28 bytes of IPv4 and UDP headers plus your own header, per packet, per client, per tick.`,`Applying a hard visibility cut with no hysteresis, so a player standing on the edge of the radius spawns and despawns an enemy every tick.`],
    good:[`There is a written bytes-per-client-per-second budget, and a graph of the real number against it from a populated test.`,`Each field has a stated range and resolution, and the sizes add up on paper to the measured packet size.`,`The interest set for a client has a cap, and exceeding it drops the lowest priority first rather than failing.`],
    bad:[`Bandwidth is “fine on LAN”.`,`The packet format is a struct written straight to the socket, and nobody can say how many bits a position takes.`] },
  how:[`Write the budget before any code. Pick the worst connection you support, say 64 kbit/s down on mobile or 256 kbit/s on desktop. Budget upstream separately: an input packet of about 10 bytes plus 28 of headers at 30 Hz is 38 x 30 = 1,140 B/s, about 9 kbit/s, an order of magnitude below the downstream budget, so downstream is where you work. Subtract headers (28 bytes of IP and UDP on IPv4, 48 on IPv6, plus yours, at the tick rate). The rest is payload bytes per tick. Divide by the number of entities you intend to show at once. That is your cost per entity, and every later decision is checked against it.`,`Choose each field’s range and resolution from the map and the rules. A 2 km by 2 km by 200 m world at 5 cm is 40,000 steps per horizontal axis, which is 16 bits, and 4,000 steps vertically, which is 12 bits. A position is then 44 bits, not 96. Write the range and resolution next to the field, in code, as constants.`,`Pack bits, not bytes. A boolean is 1 bit, a value from 0 to 1000 is 10 bits, and an enum with five members is 3 bits. Write a bit writer and reader once, with one function per field kind, and make the reader reject a value outside its declared range instead of trusting it.`,`Send rotations in smallest-three form. Drop the largest component of a unit quaternion, send its 2-bit index and the other three at 9 or 10 bits each, and rebuild the fourth from the unit-length rule. That is 29 or 32 bits instead of 128.`,`Delta-encode against an acknowledged baseline. Have the client send back the number of the latest snapshot it applied. Keep the last few snapshots per client. Encode changed fields only, relative to that snapshot, and send a full state when no acknowledgement exists yet or the baseline is too old.`,`Give every entity a priority and keep a per-client accumulator. Each tick add the entity’s priority to its accumulator, sort, and write entities into the packet until the byte budget is spent. Reset the accumulator only for entities that fit. Entities that did not fit keep their accumulated priority and go first next tick.`,`Make priority depend on what the player would notice: distance to the viewer, whether the entity is in view, whether it is the target or an attacker, and how long since it was last sent. Never make it a constant.`,`Filter before you serialise. Put entities in a uniform grid with cell size equal to the interest radius. A client reads its own cell and the eight around it, then applies the exact radius. Use a larger exit radius than entry radius, about 20 per cent (a starting value, tune it), so edge cases do not flicker.`,`Use dormancy for things that rarely change: doors, pickups, destroyed props, anything idle. They cost nothing per tick until something wakes them. Make waking an explicit, tested call.`,`Tier update rates by distance. A sensible start is every tick within 20 m, every third tick to 60 m, every tenth to 150 m, and once a second beyond. Tune the tiers against a populated test and what the camera can actually see.`,`Instrument the sender. Log per client, per second: bytes out, packets, entities sent, entities dropped for budget, and the interest-set size. Chart the percentiles, not the mean, because the worst client pays the bill.`],
  ai:{ yes:[`Compute a bandwidth budget from a player count, tick rate and field list, showing every term, and mark which line dominates.`,`Choose range and resolution for each field from a described map and movement speed, and give the bit count.`,`Write a bit writer and reader with property tests that round-trip random values and boundary values.`,`Review a replication or visibility design for the lost-packet case, the edge-of-radius case and the crowd case.`],
       no:[`Tell you what resolution a player will notice. That is a playtest, and it depends on the camera, the screen and the genre.`,`Decide how to degrade in a crowd. Dropping far players, lowering their rate and merging them into one marker have different effects on how the game feels, and that is a design decision.`,`Certify a bandwidth number. Only a populated test on a throttled link does.`] },
  prompts:[{l:'Bandwidth budget',p:`Our game has [PLAYERS] players per match at [TICK] Hz. Each client sees at most [VISIBLE] entities at once. Entity fields are: [FIELDS WITH RANGES]. Compute, showing the arithmetic: bits per entity at the resolution I give, bytes per packet including 28 bytes of IP and UDP headers and [HEADER] bytes of our own, kilobits per second per client, and total server egress. Then say which field dominates and what happens to the numbers if the crowd doubles.`},
    {l:'Interest-set review',p:`Here is our interest management code: [CODE]. List every way a client could miss an entity it should see or be sent one it should not: entry and exit at the radius edge, a lost spawn message, a teleport, a large crowd that exceeds the cap, a reconnect. For each, name the symptom the player sees and a test that would show it.`}],
  verify:[`Does the measured packet size equal the sum of the field bit counts, plus headers? If not, something is being sent that nobody budgeted.`,`Does a receiver that loses one packet in ten still converge to the server’s state, or does it drift until the next full snapshot?`,`Does every quantised value round-trip within half a step at the extremes of its range, including the map edge?`,`When 100 players stand in one cell, does the per-client byte count stay under the budget, and what is dropped?`,`Is the interest-set cost per tick measured at the real population, not extrapolated from a ten-player test?`],
  test:[`Run the real crowd, not the average one. Put every bot in one room, then measure bytes per client per second at the 50th and 99th percentile.`,`Throttle a link to your lowest supported bandwidth and add 2 to 5 per cent packet loss. Check that the budget holds and the state converges. Watch for stalls rather than averages.`,`Walk a player along the edge of an interest radius and watch for an entity that appears and disappears. Repeat with the entity moving.`,`Fuzz the reader: feed it random bytes and boundary values. It must reject or clamp, never crash or read out of range.`,`Record one hour of a bot match and total the bytes. Multiply by your player’s expected session length to produce a data-use figure you can put on the store page.`],
  rel:[['server-state-sync','State sync chooses what is sent and how the client smooths it. This topic is the bit-level and per-client budget under that choice.'],['server-realtime-protocol','The protocol topic defines the frame and op codes. This one packs the payload inside them and decides which messages are worth sending.'],['server-scaling','Scaling counts instances and fan-out between servers. This topic is the fan-out from one server to its clients, and the per-client CPU cost of deciding it.'],['server-authority','Interest management is only safe if the server is authoritative and the client never receives what it must not see.'],['craft-memory-and-gc','A per-tick, per-client serialiser that allocates will stall the garbage collector. Pre-sized buffers are the same discipline.']],
  });
TECH('server-bandwidth-and-interest-management',[
  {n:'Bounded quantisation', how:`Pick min, max and resolution per field. The integer is round((value - min) / (max - min) * steps), and the bits are ceil(log2(steps + 1)). The decoder inverts it. For a 2,000 m axis at 5 cm, that is 40,000 steps and 16 bits.`, fit:`Positions, velocities, angles, health, any bounded float. It is the first thing to do and the cheapest.`, cost:`A visible grid if the resolution is too coarse, and a clamp to handle values that leave the range. The range is a rule you must enforce.`, alt:`Sending float32, which is simple and costs 32 bits per axis for precision no player can see.`},
  {n:'Smallest-three quaternion', how:`A unit quaternion has x²+y²+z²+w²=1, so the largest component is recoverable from the other three. Send its index in 2 bits and the three smaller components in 9 or 10 bits each. The smaller three lie in [-0.7071, +0.7071], so that range is the quantisation range.`, fit:`Full 3D orientation: aircraft, free-look cameras, ragdolls, physics bodies.`, cost:`A little code for the index and the reconstruction, and slightly lossy. At 9 bits the step is about 0.0028 per component.`, alt:`Yaw only, at 8 to 10 bits, which is far cheaper and enough for any character that stays upright.`},
  {n:'Delta against an acknowledged baseline', how:`The client acks the number of the newest snapshot it applied. The server encodes the next snapshot as changes relative to that one, one flag per field or entity. If no ack has arrived, or the baseline is too old, send full state.`, fit:`Any state that mostly stays the same from tick to tick, which is most of a game world. Fiedler’s cube demo cut a changed position from 50 bits to 26.1 on average with this (the average is for changed positions only).`, cost:`The server stores recent snapshots per client, and you must handle the first packets, long loss, and a client that stops acking.`, alt:`Full snapshots every tick, which are trivially safe against loss and cost several times the bandwidth.`},
  {n:'Priority accumulator with a byte budget', how:`Each client has a float per entity. Every tick it adds the entity’s priority. Entities are sorted by accumulator and written into the packet until the byte budget is spent. Written entities reset to zero. The rest keep their value.`, fit:`Crowded scenes and any link with a hard bandwidth ceiling. It makes the budget a rule instead of a hope.`, cost:`A sort or partial sort per client per tick, and priority functions that need tuning. A bad priority starves a class of entity.`, alt:`Fixed update rates per class, which are simple and waste budget when a class is quiet and starve it when a class is busy.`},
  {n:'Uniform grid or spatial hash interest', how:`Entities live in cells of side equal to the interest radius, indexed by cell coordinate. A client’s interest set is the entities in its 3 by 3 block of cells, filtered by exact distance, with a larger exit radius than entry radius.`, fit:`Open worlds and battle royales. For a 4 km square map at a 150 m radius, the 3 by 3 block is 1.3 per cent of the area.`, cost:`The grid must be updated as entities move, and a crowd in one cell is still a crowd. Cell size is a tuning decision.`, alt:`All-pairs distance checks, which are O(N²) per tick. At 100 players that is 10,000 distance checks a tick, which is cheap; at 10,000 players it is 100 million. The break point depends on your hardware, so measure it.`},
  {n:'Replication graph or persistent relevancy nodes', how:`Instead of every entity asking whether it is relevant to every connection, long-lived nodes (grid cells, always-relevant lists, dormant sets) hold precomputed lists that are shared across frames and connections. A client’s update is the union of the nodes it subscribes to.`, fit:`Hundreds of players and tens of thousands of replicated objects, where the CPU cost of per-entity per-connection relevancy is the bottleneck.`, cost:`You structure the game’s replication around the nodes. A bad node assignment, such as a thing marked always relevant, quietly sends it to everyone.`, alt:`The default per-actor relevancy checks, which Epic’s documentation says bottleneck the server’s CPU at 100 players and about 50,000 actors.`},
  {n:'Unreal relevancy flags and update frequency', how:`Per actor: bAlwaysRelevant sends it to everyone and overrides bOnlyRelevantToOwner. bOnlyRelevantToOwner restricts it to its owner. NetCullDistanceSquared is the squared maximum distance from the client’s viewport. NetUpdateFrequency is the most updates per second the actor will attempt, MinNetUpdateFrequency the least. Epic’s adaptive scheme lowers the rate once an actor has had no meaningful update for 2 seconds, reaching the minimum after 7.`, fit:`Small and mid-size player counts, where per-actor checks are affordable and the flags express the design.`, cost:`The checks are per actor per connection, which is what the Replication Graph exists to replace at 100 players and 50,000 actors. A stray bAlwaysRelevant sends the actor to every client.`, alt:`Replication Graph or Iris for large counts.`},
  {n:'Crowd cap and coarse tier', how:`Cap each client’s interest set, say the 64 highest-priority entities at full detail. Past the cap, send the rest at a low rate with only position and a type, or as a count. Choose the cap from the per-client budget divided by the cost per entity.`, fit:`Crowds, battles and events at any scale, and the main lever once a shard holds thousands of players. The cap is what keeps one cell from breaking the budget.`, cost:`Players see a crowd that is coarse or incomplete. You must decide who is dropped, and a bad rule drops the player the viewer cares about.`, alt:`No cap, which lets one crowded cell exceed the budget for everyone in it.`},
  {n:'Dormancy', how:`Mark an object as asleep so the replication system skips it. Wake it for one update when something changes, then put it back to sleep.`, fit:`Doors, pickups, buildings, props, anything idle most of the time. Unreal’s documentation calls dormancy one of the most significant optimisations available.`, cost:`You must wake the object on every change, and a missed wake is a silent desync.`, alt:`Lowering the object’s update rate, which still pays for a check every tick.`}
]);
ENGINE('server-bandwidth-and-interest-management',{
  godot:{ term:`Godot’s high-level multiplayer sends a MultiplayerSynchronizer’s properties to every peer it is visible to. Visibility is a per-peer boolean you control, plus a replication interval. Interest management in Godot is the visibility filter, refreshed on a timer you choose.`,
    api:['MultiplayerSynchronizer.add_visibility_filter()','MultiplayerSynchronizer.update_visibility()','MultiplayerSynchronizer.visibility_update_mode','MultiplayerSynchronizer.replication_interval','Timer.timeout'],
    snippet:`extends MultiplayerSynchronizer
const ENTER := 150.0
const EXIT := 180.0                      # leave later than you enter
var _seen: Dictionary = {}               # peer id -> true
func _ready() -> void:
	visibility_update_mode = VISIBILITY_PROCESS_NONE   # refresh on our own timer
	add_visibility_filter(_wants)
	var t := Timer.new()
	t.wait_time = 0.25
	t.autostart = true
	t.timeout.connect(update_visibility)
	add_child(t)
func _wants(peer: int) -> bool:
	var r: float = EXIT if _seen.get(peer, false) else ENTER
	_seen[peer] = Game.player_distance(peer, get_parent()) < r   # your own lookup
	return _seen[peer]`,
    pitfall:`Leaving visibility_update_mode on its default, which re-runs every filter for every peer on every process frame. With a few hundred synchronizers and a distance check each, the server spends its frame deciding who sees what. Refresh on a timer, 4 times a second is a starting value for a 150 m radius, not a rule, and let the replication interval do the per-tick rate.`,
    map:`The filter plus the timer is the same job Unity’s CheckObjectVisibility and NetworkShow or NetworkHide do, and what Unreal’s relevancy and replication graph do for actors. Godot gives you the hook and expects you to bring the spatial structure.` },
  unity:{ term:`Netcode for GameObjects spawns a NetworkObject on every client by default. Visibility is the server’s control: an object hidden from a client is despawned there and sends it no traffic. Distance-based interest management is code you write against that API.`,
    api:['NetworkObject.CheckObjectVisibility','NetworkObject.NetworkShow(ulong)','NetworkObject.NetworkHide(ulong)','NetworkObject.IsNetworkVisibleTo(ulong)','NetworkManager.ConnectedClientsIds'],
    snippet:`public class Interest : NetworkBehaviour {
    const float Enter = 150f, Exit = 180f;
    float Dist(ulong id) {
        var p = NetworkManager.SpawnManager.GetPlayerNetworkObject(id);
        return p ? Vector3.Distance(transform.position, p.transform.position) : float.MaxValue;
    }
    public override void OnNetworkSpawn() {
        if (!IsServer) return;
        NetworkObject.CheckObjectVisibility = id => Dist(id) < Enter;
        InvokeRepeating(nameof(Refresh), 0.25f, 0.25f);
    }
    void Refresh() { foreach (var id in NetworkManager.ConnectedClientsIds) {
        if (id == NetworkManager.ServerClientId || id == OwnerClientId) continue;
        float d = Dist(id); bool seen = NetworkObject.IsNetworkVisibleTo(id);
        if (!seen && d < Enter) NetworkObject.NetworkShow(id); else if (seen && d > Exit) NetworkObject.NetworkHide(id);
    } }
}`,
    pitfall:`Running the distance loop every frame inside Update. The cost is objects times players, every frame, and it is where a profiler points once the player count is in the dozens (an illustrative figure, not a measured one). Refresh a few times a second, and use a grid to find candidates before measuring exact distance. Also note that hiding despawns the object on that client, so anything the client held on it is gone and re-created on show.`,
    map:`CheckObjectVisibility gates the first spawn, and NetworkShow and NetworkHide handle every change after it. Godot folds both jobs into one filter callback and one update_visibility() call.` },
  note:`Neither engine gives you bit packing for free at the level this topic teaches. Both quantise a few built-in types, and for custom fields you choose the format. The Go tab shows the quantiser and bit writer in a form you can test on its own, which is how you should write them in any language.` });
GO('server-bandwidth-and-interest-management',{
  api:['math.Round','math.Ceil','Quantiser.Encode / Decode','Writer.Write','Reader.Read / ReadQ','errors.New'],
  snippet:`package netpack

import (
	"errors"
	"math"
)

var (
	ErrShort = errors.New("netpack: buffer too short")
	ErrRange = errors.New("netpack: value or width out of range")
)

// Quantiser maps a float in [Lo, Hi] to an integer of Bits bits.
type Quantiser struct {
	Lo, Hi float64
	Steps  uint32
	Bits   uint
}

// NewQuantiser needs res > 0. res is the largest step you accept.
// If hi <= lo there is nothing to send: Steps and Bits are 0.
func NewQuantiser(lo, hi, res float64) Quantiser {
	q := Quantiser{Lo: lo, Hi: hi}
	if hi > lo && res > 0 {
		q.Steps = uint32(math.Ceil((hi - lo) / res))
	}
	for uint64(1)<<q.Bits <= uint64(q.Steps) {
		q.Bits++
	}
	return q
}

func (q Quantiser) Encode(v float64) uint32 {
	if q.Steps == 0 || math.IsNaN(v) {
		return 0
	}
	v = math.Min(math.Max(v, q.Lo), q.Hi)
	return uint32(math.Round((v - q.Lo) / (q.Hi - q.Lo) * float64(q.Steps)))
}

// Decode rejects an integer a hostile client made up.
func (q Quantiser) Decode(n uint32) (float64, error) {
	if n > q.Steps {
		return 0, ErrRange
	}
	if q.Steps == 0 {
		return q.Lo, nil
	}
	return q.Lo + float64(n)/float64(q.Steps)*(q.Hi-q.Lo), nil
}

// Writer packs values least significant bit first.
type Writer struct {
	buf  []byte
	bits uint
}

func (w *Writer) Write(v uint32, n uint) error {
	if n > 32 {
		return ErrRange
	}
	for i := uint(0); i < n; i++ {
		if w.bits%8 == 0 {
			w.buf = append(w.buf, 0)
		}
		if v>>i&1 == 1 {
			w.buf[w.bits/8] |= 1 << (w.bits % 8)
		}
		w.bits++
	}
	return nil
}

func (w *Writer) Bytes() []byte { return w.buf }

type Reader struct {
	buf  []byte
	bits uint
}

func NewReader(b []byte) *Reader { return &Reader{buf: b} }

// Read returns ErrShort instead of panicking when the packet ends early.
func (r *Reader) Read(n uint) (uint32, error) {
	if n > 32 {
		return 0, ErrRange
	}
	if r.bits+n > uint(len(r.buf))*8 {
		return 0, ErrShort
	}
	var v uint32
	for i := uint(0); i < n; i++ {
		v |= uint32(r.buf[r.bits/8]>>(r.bits%8)&1) << i
		r.bits++
	}
	return v, nil
}

// ReadQ reads one quantised field and checks it is inside its range.
func (r *Reader) ReadQ(q Quantiser) (float64, error) {
	n, err := r.Read(q.Bits)
	if err != nil {
		return 0, err
	}
	return q.Decode(n)
}
`,
  pitfall:'Trusting the decoded integer. A hostile client can send any bit pattern, and a short packet is the easiest malformed one. Here Read returns ErrShort and Decode returns ErrRange for a value above Steps, so game code never sees a position outside the world. Test the quantiser at Lo, Hi and one step either side, and check that Encode then Decode is within half a step.' });
INTERVIEW('server-bandwidth-and-interest-management',{
  junior:[
    { q:`Why does sending every player to every other player stop working as a game grows?`,
      a:`Each of N players receives updates about the other N minus 1, so the total is N times N minus 1 per tick. At 100 players that is 9,900 updates per tick. At 10,000 players it is about 100 million. The cost is quadratic in the crowd, so the answer is to send each player only what they can use, not to shrink each update.`,
      follow:`If each update is 8 bytes at 30 Hz, what does one client receive when it sees all 99 others?`,
      red:`Says the fix is a faster server or a bigger pipe, with no mention of reducing what is sent.` },
    { q:`A position is three float32 values. How would you make it smaller, and what do you need to know first?`,
      a:`Quantise it. You need the range and the resolution you can accept. A 2,000 m axis at 5 cm resolution is 40,000 steps, which needs 16 bits, against 32. Send the integer and rebuild the float on the other side. The decision on resolution comes from what a player can see, not from what is convenient.`,
      follow:`What goes wrong at the edge of the range?`,
      red:`Proposes compressing the packet with a general-purpose compressor instead of reducing the field.` },
    { q:`What does a packet cost beyond its payload?`,
      a:`28 bytes of IPv4 and UDP headers plus your own header. At 30 packets per second that is 840 bytes per second per client before a single entity, and for a small payload the headers can be a large fraction. It is also why one packet per tick, not one per entity, is the norm.`,
      follow:`Why is a payload over about 1,200 bytes risky?`,
      red:`Counts only payload bytes and is surprised that the measured number is higher.` }
  ],
  mid:[
    { q:`Explain delta compression against an acknowledged baseline. Why not against the last packet you sent?`,
      a:`The client reports the newest snapshot number it applied. The server encodes changes relative to that snapshot. If you encode against the last packet sent and one is lost, the client applies a delta to a state it does not hold and is wrong until a full state arrives. The acknowledged baseline survives loss. The cost is a snapshot history per client and a full-state fallback when no baseline exists.`,
      follow:`What do you do when the baseline is half a second old?`,
      red:`Describes deltas without any acknowledgement, or without a fallback to full state.` },
    { q:`How does a priority accumulator work, and what does it guarantee?`,
      a:`Each client has a number per entity. Every tick it gains the entity’s priority. Entities are sorted by that number and written into the packet until the byte budget is spent. Those that fit reset to zero, those that did not keep their value. It guarantees that no entity is starved forever, because the number only grows until it wins, and that the packet never exceeds the budget. It does not guarantee latency for a low-priority entity.`,
      follow:`What goes into the priority function for an enemy player compared with a door?`,
      red:`Uses a fixed order or round-robin and calls it prioritisation.` },
    { q:`Design interest management for a 4 km square map with a 150 m view radius.`,
      a:`A uniform grid with 150 m cells: 27 by 27, or 729 cells. A client reads its own cell and the eight neighbours, then filters by exact distance. The block is 9 cells, about 1.3 per cent of the map, so an evenly spread crowd of 100 puts about 1.25 other players in a player’s 3 by 3 block, and about 0.4 inside the exact 150 m circle. Use a larger exit radius to stop flicker, refresh a few times a second, cap the set, and say that a crowd in one cell is the worst case that you test.`,
      follow:`What happens when 80 players stand in one cell?`,
      red:`Loops over every entity for every client every tick and calls it a filter.` },
    { q:`What is smallest-three quaternion compression?`,
      a:`A unit quaternion’s four components satisfy x²+y²+z²+w²=1. Send the index of the largest component in 2 bits and the other three in 9 or 10 bits each, in the range plus or minus 0.7071. The receiver rebuilds the largest from the unit rule, taking it as positive after negating the quaternion if needed. That is 29 to 32 bits instead of 128.`,
      follow:`When would you send only yaw?`,
      red:`Knows the name and cannot say what is sent or why the range is 0.7071.` }
  ],
  senior:[
    { q:`Your 100-player battle royale server is CPU-bound on replication, not network-bound. What do you check and change?`,
      a:`Profile the per-connection per-object relevancy and prioritisation path. At 100 connections and tens of thousands of objects, asking every object about every connection is the cost. Move to persistent structures that share work: a spatial grid, always-relevant lists, and dormancy for the many static or idle objects. That is what Unreal’s Replication Graph was built for, and Iris moves in the same direction with quantised state and shared work. Then check that updates are not serialised per connection when they could be shared.`,
      follow:`How do you find out which actors dominate the cost?`,
      red:`Proposes lowering the tick rate as the only lever.` },
    { q:`You must keep a mobile game under 5 MB per hour of play. What is your budget and how do you hold it?`,
      a:`5 MB an hour is about 11 kbit/s on average. Subtract headers, which at 20 packets per second are 560 bytes per second, about 4.5 kbit/s. That leaves a payload of a few kilobits per second, so the design must send little: a low rate, deltas, small fields and a small interest set. Use a hard per-client budget with priority so the cap holds in a crowd, and measure with a recorded session, not a calculation.`,
      follow:`What do you cut first if the measured number is double?`,
      red:`Gives a number without subtracting headers or without a way to enforce it in a crowd.` },
    { q:`The team wants to raise the interest radius from 150 m to 250 m for a gameplay reason. What does it cost and what do you do?`,
      a:`Area grows with the square of the radius, so the set is about 2.8 times larger at an even density, and the worst crowd grows too. Bandwidth and the CPU cost of the set both rise. Ask what the gameplay reason needs: the player may need to know an enemy exists, not their full state. Send a coarse tier at a low rate to 250 m and full detail inside 150 m. Re-run the crowd test.`,
      follow:`Does a larger radius change what a cheater can learn?`,
      red:`Changes the constant and ships it.` }
  ] });
FACTS('server-bandwidth-and-interest-management',[
  { claim:`Epic’s Replication Graph documentation says a Battle Royale match starts with 100 connected players and about 50,000 replicated actors, and that the standard strategy, in which each replicated actor decides for each connected client whether to send an update, bottlenecks the server’s CPU.`, asOf:'2026-10-05', src:'https://dev.epicgames.com/documentation/en-us/unreal-engine/replication-graph-in-unreal-engine' },
  { claim:`Unreal’s Iris is an opt-in replication system that runs alongside the legacy one. Epic’s overview page labels it experimental and enabled in four steps (the Iris plugin in the .uproject, SetupIrisSupport(Target) in the module’s .Build.cs, bUseIris = true in the .Target.cs, and entries in DefaultEngine.ini), with a runtime switch -UseIrisReplication. The legacy system stays the default.`, asOf:'2026-10-05', src:'https://dev.epicgames.com/documentation/en-us/unreal-engine/introduction-to-iris-in-unreal-engine' },
  { claim:`Unreal’s networking overview describes dormancy as controlling whether an actor is added to a connection’s list of actors considered for replication, and calls it one of the most significant network optimisations.`, asOf:'2026-10-05', src:'https://dev.epicgames.com/documentation/en-us/unreal-engine/networking-overview-for-unreal-engine' },
  { claim:`Godot’s MultiplayerSynchronizer has replication_interval and delta_interval (both default 0.0, meaning every network process frame), public_visibility (default true), add_visibility_filter() and set_visibility_for(), and a visibility_update_mode that defaults to updating every process frame.`, asOf:'2026-10-05', src:'https://docs.godotengine.org/en/stable/classes/class_multiplayersynchronizer.html' },
  { claim:`In Netcode for GameObjects, a NetworkObject hidden from a client is despawned there and generates no traffic for it. NetworkObject.CheckObjectVisibility is called when a client connects or just before spawn, and with no callback the object is visible to all clients.`, asOf:'2026-10-05', src:'https://mp-docs.dl.it.unity3d.com/netcode/2.3.2/basics/object-visibility/' },
  { claim:`Valve’s Source networking page gives cl_updaterate a default of 20, says the server never sends more updates than simulated ticks or the client’s requested rate, and that sv_minrate and sv_maxrate bound the client’s requested rate in bytes per second.`, asOf:'2026-10-05', src:'https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking' },
  { claim:`Glenn Fiedler’s snapshot compression article starts from 17.38 Mbit/s for 901 cubes at 60 Hz and targets 256 kbit/s, using smallest-three orientation at 29 bits, positions at 50 bits, and delta encoding against an acknowledged baseline.`, asOf:'2026-10-05', src:'https://gafferongames.com/post/snapshot_compression/' }
]);
DIAGRAM('server-bandwidth-and-interest-management', { kind:'flow', title:'Each tick, for each client: send less, then send it smaller',
  steps:[{id:'world',t:'Server world state',d:'every entity, full precision'},{id:'interest',t:'Interest filter',d:'grid cell plus radius'},{id:'rate',t:'Rate and dormancy',d:'far and idle entities skip ticks'},{id:'prio',t:'Priority accumulator',d:'sort by what was missed'},{id:'delta',t:'Delta against ack',d:'only changed fields'},{id:'pack',t:'Quantise and bit-pack',d:'bounded ranges, smallest-three'},{id:'packet',t:'One packet to the budget',d:'under about 1,200 bytes'}],
  edges:[['world','interest'],['interest','rate'],['rate','prio'],['prio','delta'],['delta','pack'],['pack','packet']],
  note:'The order is the point: the cheap cuts come first because an entity never sent costs no bits at all.' });
EXPLAINER('server-bandwidth-and-interest-management', { kind:'explainer', title:'A priority accumulator filling a packet that is too small',
  frames:[
    { t:'Five entities, and a packet with room for three', spec:{ kind:'matrix', rows:['Player','Enemy','Grenade','Door','Crate'], cols:['Priority per tick','Accumulated','In the packet'], cells:[['4','0',''],['3','0',''],['2','0',''],['0.5','0',''],['0.1','0','']] } },
    { t:'Tick 1 adds each entity\'s priority to its accumulator', spec:{ kind:'matrix', rows:['Player','Enemy','Grenade','Door','Crate'], cols:['Priority per tick','Accumulated','In the packet'], cells:[['4','4',''],['3','3',''],['2','2',''],['0.5','0.5',''],['0.1','0.1','']] } },
    { t:'The top three are sent, and only they reset to zero', spec:{ kind:'matrix', rows:['Player','Enemy','Grenade','Door','Crate'], cols:['Priority per tick','Accumulated','In the packet'], cells:[['4','0','sent'],['3','0','sent'],['2','0','sent'],['0.5','0.5','waits'],['0.1','0.1','waits']] } },
    { t:'Tick 2: the same three are sent, and the door and crate keep growing', spec:{ kind:'matrix', rows:['Player','Enemy','Grenade','Door','Crate'], cols:['Priority per tick','Accumulated','In the packet'], cells:[['4','0','sent'],['3','0','sent'],['2','0','sent'],['0.5','1.0','waits'],['0.1','0.2','waits']] } },
    { t:'Tick 5: the door has 2.5 against the grenade\'s 2, so it takes the grenade\'s place', d:'Waiting raises an entity\'s claim, so a low priority means later, never never.', spec:{ kind:'matrix', rows:['Player','Enemy','Grenade','Door','Crate'], cols:['Priority per tick','Accumulated','In the packet'], cells:[['4','4','sent'],['3','3','sent'],['2','2','waits'],['0.5','2.5','sent'],['0.1','0.5','waits']] } },
    { t:'The budget held and nothing starved', d:'Every tick the packet holds three entries; every entity is sent in the end, the important ones far more often.', spec:{ kind:'loop', steps:[{ t:'Add each entity\'s priority', d:'nearer and more important entities add more' }, { t:'Sort by accumulated value' }, { t:'Fill the packet', d:'until the byte budget is spent' }, { t:'Reset what was sent', d:'everything else keeps its claim' }] } }
  ] });

T('server-transport-and-relays',{ d:'server', t:'Transports: UDP, reliability, QUIC, WebRTC and relays', tag:'A transport is a bet about what a lost packet should cost. Pick it, then plan the path: direct, hole-punched or relayed.',
  what:`How bytes get from one machine to another, below the protocol topic and above the wire. It has four layers of decision. First, the carrier: UDP, TCP, QUIC, a WebSocket, or a WebRTC data channel, each of which decides what happens to a lost packet and who is blocked while it is repaired. Second, the reliability you build on top: sequence numbers, acknowledgements, selective resends and redundancy, so that an input is reliable and a position is not. Third, the path: a direct address, a connection through two NATs by hole punching, or a relay that both sides can reach. Fourth, the exposure: a public address that anyone can flood, a handshake that cannot be spoofed, and the question of whether the address of your server is a secret. Message layout, op codes and authentication belong to the realtime protocol topic. Bytes per tick belong to the bandwidth topic. This one is about packets, loss, paths and who can reach whom.`,
  why:[`TCP delivers in order, so one lost packet holds back every later one that has already arrived. Fiedler puts a 125 ms ping at about a fifth of a second to resend at best, and half a second or more in bad conditions. At 60 snapshots a second, 200 ms is 12 snapshots stuck in a queue behind one old one. The game then renders the past in a burst. That is why real-time games use UDP and add reliability only where a message needs it.`,`Every packet has an envelope you pay for. IPv4 plus UDP is 28 bytes, IPv6 plus UDP is 48. Ethernet allows 1,500 bytes in a packet, IPv6 guarantees only 1,280, and QUIC assumes 1,200 bytes of UDP payload. A payload that is “a bit too big” is split into fragments, and the whole packet is lost if any one fragment is lost. The safe ceiling is about 1,200 bytes of UDP payload, whatever the bandwidth topic says about what fits in it.`,`Most players are behind a NAT, which drops unsolicited inbound packets. Two players who each sit behind one cannot simply connect. Either they punch a hole at the same time, which usually works, or a relay carries the traffic, which always works and costs real bandwidth. Tailscale’s write-up of the same problem estimates a direct connection over 90 per cent of the time, which leaves up to a tenth, in Tailscale’s setting, that needs a relay you pay for. Your audience will differ, so measure it.`,`A public UDP port is an invitation. The source address of a UDP packet can be forged, so a server that answers an unauthenticated packet with a larger one becomes a weapon pointed at someone else, and a game server whose address is known can be flooded off the internet. Valve’s relay network and Amazon’s player gateway both exist to take that address out of the player’s hands.`,`The web changes the menu. A browser game has no raw UDP. It has WebSocket, which is TCP and inherits all of the above, WebRTC data channels, which can be unreliable, and, from 2026, WebTransport, which gives datagrams over HTTP/3. Each costs a different setup time and server stack.`],
  think:{ q:[`For each kind of message, what is the cost of it arriving late, and what is the cost of it never arriving? Which of those costs is bigger?`,`If one packet in a hundred is lost, which of my messages stall behind it, and for how long at the worst round trip I support?`,`What is the largest packet I send, and what is its size on the wire with IPv6, tunnels and a VPN in the path?`,`Which of my players cannot connect directly, what do they get instead, and what does that cost per hour of play?`,`If a player’s phone moves from Wi-Fi to cellular mid-match, does the session survive, or does it die and rejoin?`,`What does the server do with a packet from an address it has never seen, and is the reply ever larger than the request?`,`Does the address of a game server appear anywhere a player, a streamer or a log can read it?`],
    trade:[`Building reliability on UDP gives you per-message control and removes head-of-line blocking you did not choose. It also hands you congestion control, ordering, fragmentation and a handshake, all of which are easy to write and hard to get right. A library such as Valve’s GameNetworkingSockets or Unity Transport has already paid that cost.`,`QUIC gives streams that do not block each other, encryption, connection migration and a handshake that already resists spoofing, and it sits on the same UDP. The price is a heavier library, a less common server stack in games, and in the browser a newer API.`,`A relay always connects, hides both addresses and survives a hard NAT. It adds one hop of latency, makes you carry every byte twice, and becomes the thing that gets attacked instead.`,`WebSocket works everywhere and passes through corporate proxies. It is TCP, so a lost packet stalls the stream, and there is no unreliable mode at all.`,`More redundancy, such as repeating the last three inputs in every packet, cuts perceived loss and multiplies upstream bytes. It is cheap for inputs and unaffordable for snapshots.`],
    traps:[`Using TCP for the match and UDP for “fast” things, then discovering that the TCP stream’s retransmission stalls are the lag players complain about. Fiedler’s advice is not to mix the two.`,`Writing your own acknowledgement scheme and forgetting what happens when sequence numbers wrap, or when a late packet from a previous session at the same address arrives. Use a random session salt and compare sequence numbers with wrap-around logic.`,`Sending a 1,400-byte packet because it fits on the office LAN, or because a library’s default says so: Unity Transport’s fragmentation stage assumes an MTU of roughly 1,400. On a path with a smaller MTU, such as a tunnel or VPN, it fragments, and loss compounds across fragments. Keep your own payloads under 1,200 whatever the library assumes.`,`Treating “NAT type” as a property of the player. It is a property of the pair. Two easy NATs punch through. An easy NAT and a hard one often need a port-spraying attempt. Two hard ones usually fall back to a relay.`,`Letting NAT bindings expire during a quiet moment. The standard asks for a binding to last at least two minutes idle, and a router that does not follow it will close the hole sooner. A pause screen with no packets is where a hole closes.`,`Keying a session by the sender’s IP and port only. A phone changing network gets a new address and the session is gone. Keying by a connection or session id, and moving the address only after an authenticated newer packet, is what QUIC does.`,`Answering any unauthenticated packet with a bigger one. That is the amplification attack, and it is introduced by a friendly “server info” reply as often as by a handshake.`,`Putting the relay’s capacity plan in the “later” column. When a large share of a launch weekend’s players cannot hole-punch, relay egress is the bill.`,`Reading a bufferedAmount that keeps rising on a WebSocket as a server problem. It is the client’s TCP stream falling behind, and it is exactly the stall the game cannot hide.`],
    good:[`Every message type is labelled reliable, sequenced or droppable, with the reason written next to it, and the latest-wins state is never reliable.`,`The connection path in use (direct, punched, relayed) is logged per match, along with the round trip, and someone reads that chart.`,`A session survives an address change in a test, and a flood of unauthenticated packets gets no reply at all.`],
    bad:[`“We use TCP because it is reliable.”`,`Nobody knows what fraction of players are on a relay, or what it costs.`] },
  how:[`Label every message by its failure cost before choosing a carrier. Latest-wins state (position, health bars): unreliable, newest wins. Inputs: unreliable but redundant, each packet carries the last few. One-off events (a purchase, a kill, a chat line): reliable. If everything is reliable, you have rebuilt TCP with extra steps.`,`Start from a library, not from a socket. Valve’s GameNetworkingSockets offers reliable and unreliable messages, per-packet AES-GCM-256 encryption, fragmentation of messages larger than the MTU, and ICE for peer-to-peer. Unity Transport has pipeline stages for reliable sequencing and fragmentation. Godot’s high-level multiplayer is built on ENet. Write your own only to learn, or when none of these fit.`,`If you do write a reliability layer, copy the smallest thing that works. Fiedler’s: each packet carries a sequence number, the latest sequence number received, and a 32-bit field saying which of the 32 before it arrived. That is 33 acknowledgements in every packet. At 60 packets a second the window is about half a second, so a lost acknowledgement almost always reappears in a later packet. A reliable message stays in the send buffer and rides along in packets until one that contained it is acknowledged, and is not resent more often than every 0.1 s.`,`Compare sequence numbers with wrap-around. With 16-bit numbers at 60 packets a second the counter wraps in about 18 minutes. Treat a difference of more than half the range as “the smaller one is newer”, in one tested function used everywhere.`,`Size packets by a budget. Take 1,200 bytes of UDP payload as the ceiling (QUIC’s own assumption, and under the IPv6 minimum of 1,280 less 48 bytes of headers, which is 1,232). Unity Transport’s fragmentation stage assumes about 1,400, so keep your own payloads below 1,200 and let the library fragment only the rare large message. Subtract your header, and tell the packer when it has run out of room instead of letting the socket fragment.`,`Bound the reliable window and know what it limits. A window of 32 packets in flight, the default for Unity Transport’s reliable stage, sends at most 32 packets per round trip. At a 300 ms round trip that is about 106 packets a second, so a chatty reliable channel on a bad link hits its window before it hits the bandwidth.`,`Do the connection handshake so spoofing is impractical. The client sends a request, the server answers with a challenge, and only a client that receives the challenge can answer it. Pad the request so it is larger than any reply. The open netcode standard pads its connection request to 1,078 bytes. QUIC limits an unvalidated server reply to three times what it received.`,`Put a session id in every packet and authenticate it. Move the remote address only on a packet that authenticates and carries a higher sequence number than any seen. Now a Wi-Fi to cellular change is an address update, not a reconnect, and an attacker replaying an old packet moves nothing.`,`Plan the path with ICE, and do not write it yourself. Gather candidates (host, server-reflexive from STUN, relayed from TURN), exchange them through your own signalling channel, and let the connectivity checks choose the highest-priority pair that works. The standard’s preferred order is host, then peer-reflexive, then server-reflexive, then relayed.`,`Keep NAT bindings alive. The standard says a UDP binding must survive at least two minutes idle and recommends five. Send a small keepalive every 15 to 30 seconds on any path through a NAT, including when the game is paused. RFC 8445 section 11 says ICE agents should use 15 seconds and must not go below it, and the TURN RFC notes that some NATs expire bindings well before five minutes. The 15 to 30 range is practice, not a standard. Refresh a TURN allocation before its 10-minute default lifetime ends.`,`Offer a path through restrictive networks. Some firewalls block UDP altogether. TURN can run over TCP or TLS, and Unity Relay can use secure WebSockets. It is slow and reliable-ordered, and it beats a player who cannot play.`,`For a browser client choose by feature. WebSocket if everything may be reliable and ordered (turn-based, lobby, chat). A WebRTC data channel with ordered:false and maxRetransmits:0 for real-time state. WebTransport datagrams if you control the server, can run HTTP/3 and accept that browser support is new.`,`Hide server addresses and rate-limit per player when the game is a target. A relay layer that checks a token for every packet, such as Valve’s relay network or Amazon GameLift’s player gateway, keeps the origin off the public internet and drops traffic that does not belong to a player. Your own firewall rules cannot do this for a flood larger than your uplink.`,`Test with bad networks on purpose. Unity Transport’s simulator suggests delays of 20 to 200 ms, jitter of about half the delay, and packet loss it says should rarely exceed 3 per cent even on bad mobile connections. Use those as a floor, add bursts of loss, and add a link that changes address halfway through.`],
  ai:{ yes:[`Compute the relay bill from a player count, a per-player bitrate, a topology (host-client or dedicated) and an assumed share of players that cannot connect directly, showing each term.`,`Write and property-test the wrap-around sequence comparison and the acknowledgement-bitfield update, including packets that arrive late and twice.`,`Review a handshake and a packet parser for amplification (reply larger than request), spoofed sources and replay, and say which packets get no answer.`,`Draft a per-message-type table of reliability, ordering, size and rate, and flag every message that is reliable without a reason.`,`Read a packet capture summary and say which packets were fragmented, retransmitted or sent before a binding existed.`],
       no:[`Tell you what fraction of your players are behind a hard NAT. That is telemetry from your own audience, and it differs by country and by network type.`,`Choose between QUIC, WebRTC and a vendor’s relay on your behalf. That depends on your platforms, your team and your hosting contract.`,`Confirm that a library’s behaviour in the face of loss is acceptable. Run it against a network that drops, delays and reorders.`] },
  prompts:[{l:'Message reliability table',p:`Our game sends these messages: [LIST WITH SIZES AND RATES]. For each, say whether it should be unreliable, unreliable with redundancy, or reliable, and sequenced or not. State what the player sees if it is lost and if it arrives 300 ms late. Flag any message that is reliable only by habit. Then compute packets per second and bytes per packet for the two heaviest channels against a 1,200-byte ceiling.`},
    {l:'Relay cost estimate',p:`Our game has [PEAK CONCURRENT MATCHES] matches of [PLAYERS], topology [host-client or dedicated], client upstream [KBIT/S] and downstream [KBIT/S]. Assume [PERCENT] of players cannot connect directly and are relayed. Compute relay ingress and egress in Gbit/s and in terabytes per month, show every term, and name the two assumptions the answer is most sensitive to. Do not use a price per gigabyte I have not given you.`},
    {l:'Handshake attack review',p:`Here is our connection handshake and packet parser: [CODE OR PACKET TABLE]. For each packet type, say what the server sends in reply and how large that reply is relative to the request. Identify any path where an unauthenticated sender can cause a larger reply, change a session’s remote address, or consume memory. List the packets that should get no reply, and the checks needed to make that true.`}],
  verify:[`Is every message type marked reliable, sequenced or droppable, and can you point to one that is unreliable on purpose?`,`Does a captured session show any datagram above 1,200 bytes, or any IP fragment?`,`If you pull the network cable for one second during a match, does the session continue, and does the first stale packet after it get ignored?`,`If a client’s address changes mid-session, does the server keep the session, and does a replayed old packet from a third address leave the session’s address untouched?`,`Does a packet from an unknown source, or with a bad tag, get no reply at all?`,`Can you read, from your own logs, the share of matches that ran direct, punched and relayed over the last week?`,`Does the idle pause screen keep its NAT binding open?`],
  test:[`Run the same match over three paths: LAN, a simulated 3 per cent loss link with 100 ms delay and 50 ms jitter, and the same with a burst of 20 consecutive packets lost. Measure input-to-screen latency at the 95th and 99th percentile and count the visible stalls per minute. Compare a reliable-ordered channel and an unreliable one for movement.`,`Fill the reliable window on purpose: send reliable messages at twice the window over round trip and watch for the send-queue-full error or growing delay. Record the rate where it saturates.`,`Put two clients behind consumer NATs of different types (a phone hotspot, a home router, a corporate network) and record which path ICE chooses and how long it takes. Do it for at least five network combinations.`,`Move a phone from Wi-Fi to cellular during a match, ten times. Count the sessions that survive and the seconds of silence in each.`,`Aim a packet generator at the server from a spoofed source and from an unknown one. Verify that nothing is sent back, and measure CPU per thousand dropped packets.`,`Pause the game for 3 minutes in a room with a stateful firewall in front of one player. See whether the hole is still open when play resumes.`],
  rel:[['server-realtime-protocol','That topic shapes what goes inside a packet: op codes, message ids and framing. This one decides how the packet travels, which of its messages are reliable, and how big it is allowed to be.'],['server-state-sync','Snapshots, inputs and tick rates are the traffic a transport carries. Whether they may be dropped, resent or sequenced is decided here, and loss and jitter set the interpolation delay there.'],['server-bandwidth-and-interest-management','It teaches how many bytes to put in each packet and how to fit a budget. This topic teaches why the budget has a ceiling near 1,200 bytes, what happens above it, and what the envelope costs.'],['server-anticheat','Hidden server addresses, unspoofable handshakes and per-player rate limits are the network half of abuse handling, and a relay is also the place where traffic can be authenticated before it reaches the game.'],['server-stack-choices','Choosing a relay service, a netcode library and hosting is a stack decision. This topic gives the reasons and numbers each of those choices rests on.'],['backend-api-protocol','The lobby, matchmaking and login traffic usually rides HTTP, where HTTP/3 and QUIC apply. The choice there is separate from the choice for the match, and mixing them up is a common error.']] });
TECH('server-transport-and-relays',[
  {n:'UDP with a small reliability layer of your own', how:`Sequence number, latest received, a 32-bit acknowledgement field in each packet header, a send buffer for reliable messages that rides along until acknowledged, a smoothed round-trip estimate, and a rule to resend a message no more than every 0.1 s. Add a random session salt and a challenge handshake.`, fit:`When you need per-message-type control, a small packet format, and you can test it against real loss. Teams that ship their own netcode on this are common in fast action games.`, cost:`You own congestion control, fragmentation, wrap-around, ordering and encryption. The first version works on a LAN, and every bug appears at 2 to 3 per cent loss.`, alt:`A tested library (GameNetworkingSockets, ENet, Unity Transport), which has already paid for those bugs.`},
  {n:'A transport library with message flags', how:`Choose per message at send time: reliable or unreliable, with or without Nagle-style batching. GameNetworkingSockets exposes flags for reliable, unreliable, no-Nagle and no-delay, and batches small messages for a configurable time unless told not to.`, fit:`Almost every game that is not building a network stack as its product.`, cost:`You inherit the library’s defaults for congestion and batching. A batching delay you did not know about is a few milliseconds on every message.`, alt:`Writing the layer yourself, which gives control and costs months.`},
  {n:'Redundancy instead of resend', how:`Each packet carries the last N inputs or the last few events, so a single loss is repaired by the next packet with no wait for an acknowledgement.`, fit:`Small, frequent, time-critical messages: player inputs at a high rate over a lossy link.`, cost:`Upstream bytes multiply by N. It cannot be used for snapshots. It repairs loss shorter than N packets and no more.`, alt:`Acknowledged resends, which cost no extra bytes while nothing is lost and add a round trip when something is.`},
  {n:'QUIC or WebTransport', how:`One UDP connection with encryption, independent reliable streams, optional unreliable datagrams (RFC 9221), and connection ids that survive a change of address. WebTransport exposes the same model to the browser over HTTP/3.`, fit:`HTTP/3 is already common on the web side: W3Techs reports it on about 41 per cent of websites in October 2026, so lobbies, live-ops, patch and store traffic can ride it today. Real-time play beside a UDP match, and browser real-time games where you control the server and can run HTTP/3.`, cost:`A heavier dependency, a smaller supply of engine integrations, and for browsers a recently available API. The stream model also needs a deliberate choice: a stream per reliable channel, datagrams for state.`, alt:`WebSocket for the reliable side and a WebRTC unreliable channel for state, which works in more browsers today.`},
  {n:'WebRTC data channels', how:`ICE finds a path, DTLS encrypts, SCTP carries messages. A channel is ordered or not, reliable or limited by maxRetransmits or maxPacketLifeTime. All channels in one connection share one SCTP association and congestion window.`, fit:`Browser peer-to-peer and browser-to-server games that need unreliable delivery, and any project that wants ICE, STUN and TURN already built.`, cost:`A signalling server you write, several round trips before the first game byte, a large dependency server-side, and one shared congestion window so a big message on one channel delays the others. Keep messages near 16 KB or less.`, alt:`WebTransport when you control both ends and support its browsers.`},
  {n:'WebSocket', how:`TCP with an HTTP upgrade and message framing. Check bufferedAmount before sending and drop or coalesce when it grows, because the standard WebSocket has no backpressure.`, fit:`Turn-based, social, lobby and any traffic where every message must arrive and a 200 ms stall is acceptable. Works through nearly every proxy.`, cost:`Head-of-line blocking on loss and no unreliable mode. State updates arrive in order and late.`, alt:`A WebRTC unreliable channel or WebTransport datagrams for the real-time part, with the WebSocket kept for the rest.`},
  {n:'Relay between players (TURN, Steam Datagram Relay, Unity Relay, EOS relay)', how:`Both sides connect outward to a server that forwards packets between them. TURN allocates a relayed address with a 10-minute default lifetime. Unity Relay gives the host an allocation and a join code, all packets go through the service, and it supports udp, dtls and wss. Valve’s relay carries peer-to-peer traffic over its own backbone when appropriate and hides the IP addresses. Epic Online Services P2P follows the same pattern: a middleware vendor’s documentation says it tries NAT punch-through first and falls back to relayed communication if that fails. Epic’s own page could not be read, so its relay-control options and packet limits are not listed here.`, fit:`Players behind hard NATs, games that must not reveal player addresses, and host-client matches by teams without a server fleet.`, cost:`Every byte crosses the relay twice and is paid for. One hop of latency, a capacity plan, and per-session limits (Unity Relay documents 150 players per session).`, alt:`Hole punching first and a relay only as the fallback, which is what ICE does by design.`},
  {n:'Gateway or relay in front of dedicated servers', how:`Clients connect to relay endpoints that validate a per-player token, rate-limit each player and forward to servers whose addresses stay private. Amazon GameLift’s player gateway does this and its documentation lists hiding server IPs, per-player rate limiting and token validation.`, fit:`Games that are DDoS targets, ranked or competitive titles, and servers whose address would otherwise leak to every player.`, cost:`Integration in both client and backend, one extra hop, and you now operate or buy the relay layer.`, alt:`Network-level filtering alone, which absorbs common reflection and flood traffic and does not hide the address.`},
  {n:'Fallback over TCP or TLS', how:`If UDP is blocked, connect over TURN with TCP or TLS, or over secure WebSockets.`, fit:`Players on locked-down corporate, school or hotel networks.`, cost:`It is reliable-ordered, so it behaves like TCP: stalls on loss. Offer it as a last resort and show a warning.`, alt:`Telling the player the network cannot run the game.`}
]);
ENGINE('server-transport-and-relays',{
  godot:{ term:`Godot’s default multiplayer sits on ENet, which is UDP with reliable and unreliable channels, so most games never touch a transport. Browser builds and peer-to-peer play go through WebRTC (native, non-web builds need the webrtc-native GDExtension, which Godot’s WebRTC tutorial calls out), where you decide per channel whether delivery is ordered or may be dropped, and give ICE a STUN and a TURN server.`,
    api:['WebRTCPeerConnection.initialize()','WebRTCPeerConnection.create_data_channel()','WebRTCPeerConnection.poll()','WebRTCDataChannel.put_packet()','WebRTCDataChannel.get_max_retransmits()'],
    snippet:`extends Node
var peer := WebRTCPeerConnection.new()
var state_ch: WebRTCDataChannel   # latest wins, never resent
var event_ch: WebRTCDataChannel   # reliable and ordered
func start() -> void:
\tpeer.initialize({"iceServers": [{"urls": ["stun:stun.example.org:3478"]},
\t\t{"urls": ["turn:turn.example.org:3478"], "username": "u", "credential": "p"}]})
\tstate_ch = peer.create_data_channel("state", {"negotiated": true, "id": 1, "ordered": false, "maxRetransmits": 0})
\tevent_ch = peer.create_data_channel("events", {"negotiated": true, "id": 2})
func _process(_delta: float) -> void:
\tpeer.poll()   # the channels only open while this runs
func send_state(packed: PackedByteArray) -> void:
\tstate_ch.put_packet(packed)`,
    pitfall:`Leaving the state channel at the defaults, which are reliable and ordered. It works on a LAN and then stalls behind every lost packet on a phone, the head-of-line blocking you chose WebRTC to avoid. The snippet leaves out signalling (passing the offer, answer and ICE candidates through your own server), and the poll call is what makes the channels open. The other trap is the ICE servers list: with a STUN entry and no TURN entry, the players who cannot hole-punch simply fail to connect, and in testing from one network you never see it.`,
    map:`Godot’s ENet channels (reliable, unreliable, unreliable ordered) are the same choice as a WebRTC channel’s ordered and maxRetransmits options. In Unity, the choice is the NetworkDelivery argument.` },
  unity:{ term:`Netcode for GameObjects chooses reliability per message with a NetworkDelivery value, and Unity Transport sits underneath on UDP. Relay is a service the transport connects to instead of a peer, with an allocation, a join code and a connection type of udp, dtls or wss.`,
    api:['CustomMessagingManager.SendNamedMessage()','NetworkDelivery.UnreliableSequenced','FastBufferWriter','Unity.Netcode.NetworkManager.Singleton'],
    snippet:`using Unity.Collections;
using Unity.Netcode;
using UnityEngine;

public class StateSender : MonoBehaviour {
    public void SendState(ulong clientId, Vector3 pos, uint tick) {
        using var w = new FastBufferWriter(32, Allocator.Temp);
        w.WriteValueSafe(tick);
        w.WriteValueSafe(pos);
        // positions: an old one is worthless, so never resend and drop stale ones
        NetworkManager.Singleton.CustomMessagingManager.SendNamedMessage(
            "state", clientId, w, NetworkDelivery.UnreliableSequenced);
    }
}`,
    pitfall:`Sending everything with the default, which is a reliable sequenced delivery. Movement then waits behind any lost packet. A second trap is relay on WebGL: UDP is not available there, so DTLS and plain UDP relay are not either, and you must use wss with WebSockets, which brings back reliable ordered delivery. Also, a client can only target the server with SendNamedMessage (NetworkManager.ServerClientId), so this method as written is the server side.`,
    map:`NetworkDelivery.UnreliableSequenced is Godot’s unreliable-ordered ENet mode and a WebRTC channel with ordered true and maxRetransmits 0 is close to it, though ordered partial reliability in SCTP can still hold later messages until the lost one is abandoned, so they are not identical.` },
  note:`Neither engine asks you to write a socket. What you decide is per-message delivery, which relay or ICE servers the build knows, and what the client does when the path changes. Read your library’s defaults before shipping: delivery mode, batching delay and reliable window are the three that surprise people.` });
GO('server-transport-and-relays',{
  api:['net.PacketConn','binary.BigEndian.Uint64','hmac.New','hmac.Equal','sync.Mutex','sync.RWMutex'],
  snippet:`package relay

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/binary"
	"net"
	"sync"
)

const hdr = 8 + 1 + 8 + 16 // session id, role (0 or 1), sequence (starts at 1), truncated tag

// Session keeps one key per role. A client is given only its own key, so one
// player cannot sign packets as the other.
type Session struct {
	keys [2][]byte
	mu   sync.Mutex
	addr [2]net.Addr
	last [2]uint64
}

func NewSession(master []byte) *Session {
	s := &Session{}
	for role := byte(0); role < 2; role++ {
		m := hmac.New(sha256.New, master)
		m.Write([]byte{role})
		s.keys[role] = m.Sum(nil)
	}
	return s
}

type Relay struct {
	mu       sync.RWMutex
	sessions map[uint64]*Session
}

func (r *Relay) Add(id uint64, s *Session) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.sessions == nil {
		r.sessions = map[uint64]*Session{}
	}
	r.sessions[id] = s
}

// Serve forwards a packet to the other role only if its tag verifies under the
// sender's key and its sequence is higher than any seen from that role. That
// drops replays, and moves a role's address only on a newer authentic packet.
func (r *Relay) Serve(conn net.PacketConn) error {
	buf := make([]byte, 1200+hdr)
	for {
		n, from, err := conn.ReadFrom(buf)
		if err != nil {
			return err
		}
		if n <= hdr || buf[8] > 1 {
			continue
		}
		r.mu.RLock()
		s := r.sessions[binary.BigEndian.Uint64(buf[:8])]
		r.mu.RUnlock()
		if s == nil {
			continue
		}
		role := buf[8]
		mac := hmac.New(sha256.New, s.keys[role])
		mac.Write(buf[:17])
		mac.Write(buf[hdr:n])
		if !hmac.Equal(mac.Sum(nil)[:16], buf[17:hdr]) {
			continue // never answer a packet that fails the check
		}
		seq := binary.BigEndian.Uint64(buf[9:17])
		s.mu.Lock()
		if seq <= s.last[role] {
			s.mu.Unlock()
			continue
		}
		s.last[role], s.addr[role] = seq, from
		peer := s.addr[1-role]
		s.mu.Unlock()
		if peer != nil {
			conn.WriteTo(buf[hdr:n], peer)
		}
	}
}
`,
  pitfall:'Signing both roles with one shared key, or moving the stored address on any packet that names a session. With one shared key, either player can tag a packet as the other role with a high sequence number and take that player’s traffic, so give each role its own key, derived from a session secret only the relay and the control backend hold, and hand each client only its own. A tag alone does not stop replays, so the sketch also drops any packet whose sequence is not higher than the last, which costs you reordered packets and is a fair price for movement and input traffic. It forwards the payload without the header, so the receiver cannot see the sequence, and it leaves out session expiry, key delivery and a cap on the session count. Never send anything back to a packet that fails the check.'
});
INTERVIEW('server-transport-and-relays',{
  junior:[
    { q:`Why do real-time games usually use UDP instead of TCP?`,
      a:`TCP delivers bytes in order, so a lost packet blocks every later packet until the resend arrives, even though the newer data is already there. With a 125 ms round trip that is at least about a fifth of a second. A game wants the newest state, not the old state late, so it uses UDP and adds reliability only for messages that need it. Mention that retransmission and Nagle batching also add delay.`,
      follow:`Which messages in a game would you still make reliable, and why?`,
      red:`Says UDP is “faster” with no mention of head-of-line blocking, or says it is unreliable and therefore bad for games.` },
    { q:`What is MTU, and why do game packets stay under about 1,200 bytes?`,
      a:`The largest packet a link will carry without fragmenting. Ethernet is 1,500 bytes and IPv6 guarantees 1,280. QUIC assumes 1,200. Headers take 28 bytes (IPv4 and UDP) or 48 (IPv6 and UDP). A bigger datagram is split into fragments and lost if any one fragment is lost, so loss gets worse as packets grow. Stay under the ceiling and make the packer stop instead of the network splitting.`,
      follow:`How does one percent packet loss change the chance of losing a packet that is split into ten fragments?`,
      red:`Believes bigger packets are always more efficient and ignores loss.` },
    { q:`What is NAT, and why can two players not just connect to each other?`,
      a:`A NAT router rewrites private addresses to a public one and drops inbound packets that no outbound packet asked for. Neither player has an address the other can reach first. The fix is for both to send to each other’s public address at the same time so each router sees outbound traffic first, which is hole punching, or to route through a relay.`,
      follow:`What does STUN tell a client, and what does it not solve?`,
      red:`Says to open a port on the router, and treats it as the player’s problem.` }
  ],
  mid:[
    { q:`Describe how you would add reliability and ordering on top of UDP for one channel of events.`,
      a:`Number packets, send the latest sequence number received and a bitfield of the previous 32, so each packet carries 33 acknowledgements. Keep sent reliable messages buffered with ids and send them in each outgoing packet until one containing them is acknowledged, throttling resends to about every 0.1 s. Deliver in message-id order to the receiver. Compare sequence numbers with wrap-around. Add a session salt so stale packets from an earlier session at the same address are rejected. Bound the unacknowledged window so a dead peer cannot grow memory.`,
      follow:`What happens to the 33-acknowledgement window at 60 packets per second, and what if the receiver sends nothing for a second?`,
      red:`Proposes resending on a timer with no acknowledgement scheme, or ignores sequence wrap and stale sessions.` },
    { q:`How does ICE choose a path between two players, and when does it end up on a relay?`,
      a:`Each side gathers candidates: host addresses, server-reflexive ones from a STUN server, and relayed ones from a TURN server. They swap them through signalling and test pairs with STUN binding checks in priority order, preferring host, then peer-reflexive, server-reflexive and last relayed. A relayed pair wins only when no direct pair passes, typically two NATs that map every destination differently. A direct connection comes up in most cases and the relay is the guaranteed fallback you pay for.`,
      follow:`A match works for the testers and fails for some players on a launch weekend. What do you check first?`,
      red:`Thinks STUN relays traffic, or that a TURN server is optional for a shipped product.` },
    { q:`A WebSocket-based real-time game feels laggy on mobile but fine on Wi-Fi. What is happening and what are your options?`,
      a:`TCP under the WebSocket: a lost packet stalls the stream and everything behind it, and mobile networks lose more. Options in order of effort: lower the send rate and coalesce, check bufferedAmount and drop stale updates, move state to a WebRTC data channel with ordered false and maxRetransmits 0, or to WebTransport datagrams if your server and audience support HTTP/3. Keep the WebSocket for events that must arrive.`,
      follow:`What does a WebRTC data channel cost you in setup that the WebSocket did not?`,
      red:`Suggests a bigger server, or compression, without addressing head-of-line blocking.` }
  ],
  senior:[
    { q:`Design the connection path for a cross-platform game with dedicated servers, expecting heavy DDoS attention. What does the player connect to, and what do you accept in exchange?`,
      a:`Players never learn the server address. They get a token from a backend and connect to relay endpoints that validate the token for each packet, rate-limit per player, and forward to private servers. Name the analogues: Valve’s relay network, Amazon GameLift’s player gateway. Accept an extra hop of latency, integration in client and backend, relay capacity to plan and watch, and that the relay becomes the target. Add a handshake with a challenge and a padded request so no unauthenticated packet gets a bigger reply, and keep the server query port off the public internet.`,
      follow:`The relay doubles as an authentication point. What goes wrong when a token leaks or lives too long?`,
      red:`Relies on hiding the IP in a config value, or on the cloud provider’s generic protection alone, with no per-player validation.` },
    { q:`Estimate relay cost for a peer-to-peer launch where 12 per cent of players cannot connect directly. What do you need to know, and how would you cut it?`,
      a:`Players per match, topology (in a host-client match with everyone relayed, relay egress is the host’s downstream plus the clients’), bitrates, matches per hour, and the relay share. Worked example, with bitrates invented for illustration: a host plus 8 clients at 64 kbit/s down and 32 kbit/s up per client. If every player in the match is relayed, the host sends 512 kbit/s and receives 256, so the relay carries 768 kbit/s each way, about 345 MB per hour per match, and 10,000 such matches are 7.7 Gbit/s each way. Now apply the 12 per cent share. With a service that relays a whole match (a host relay such as Unity Relay), 12 per cent of 10,000 matches is 1,200 relayed matches, 0.92 Gbit/s each way, about 0.41 TB per hour. With per-pair ICE, about one of the 8 host-client legs in a match (0.96 on average) is relayed at 96 kbit/s each way, and the total comes out near the same 0.92 Gbit/s. The real share differs by country and by network type. Cuts: lower the send rate and use interest filtering, prefer dedicated servers for large matches, fall back to relay only after punching fails, measure the real relay share and cap per-session bitrate.`,
      follow:`What is the single assumption this estimate is most sensitive to?`,
      red:`Quotes a price per gigabyte with no topology and bitrate, or assumes the relay share is zero.` },
    { q:`A phone moves from Wi-Fi to cellular mid-match. Compare what happens in plain UDP, in QUIC and in a WebSocket, and design the fix for your own protocol.`,
      a:`A WebSocket is one TCP connection bound to an address pair, so it breaks and the client reconnects and resyncs. Plain UDP keyed by address sees a new source and a stranger. QUIC identifies a connection by connection ids and validates the new path with PATH_CHALLENGE, so the connection continues. For your own protocol put a session id in every packet, authenticate each packet, and move the stored address only on an authenticated packet with a higher sequence number, so replays and spoofing cannot redirect it. Keep a short grace period before dropping the player.`,
      follow:`What stops an attacker who has captured one packet from moving the session to their address?`,
      red:`Keys the session by IP and port and calls reconnect logic “migration”.` },
    { q:`You must choose between building on QUIC, a WebRTC stack and a custom UDP protocol for a new real-time game with browser and native clients. Make the call and say what would change it.`,
      a:`Ask which platforms and which messages. If browser clients matter and the server is yours, WebTransport datagrams for state and streams for events give one model, with WebRTC data channels as the fallback where WebTransport is missing. Native only: a library such as GameNetworkingSockets or Unity Transport with per-message flags, or a custom protocol if the format must be tiny. The decision turns on browser support for your audience, team experience with the library, the relay and NAT strategy, and the cost of running HTTP/3 or an ICE stack in your hosting. Say what you would measure before committing: loss and jitter per audience, setup time, and relay share.`,
      follow:`Which part of the decision would you reverse first if browser support was thinner than expected?`,
      red:`Picks the newest technology without naming a measurement, or the oldest without naming a cost.` }
  ] });
FACTS('server-transport-and-relays',[
  { claim:`RFC 9000 requires a client’s Initial packet to be sent in a UDP datagram of at least 1,200 bytes, assumes endpoints can send datagrams of 1,200 bytes unless they know more, limits an unvalidated server to three times the bytes it has received, and supports connection migration with connection ids and PATH_CHALLENGE path validation.`, asOf:'2026-10-05', src:'https://www.rfc-editor.org/rfc/rfc9000.html' },
  { claim:`RFC 9221 defines unreliable DATAGRAM frames for QUIC. They are not retransmitted, are subject to the connection’s congestion control, and the max_datagram_frame_size parameter defaults to 0, meaning unsupported until negotiated.`, asOf:'2026-10-05', src:'https://www.rfc-editor.org/rfc/rfc9221.html' },
  { claim:`RFC 8656 (TURN) sets the default lifetime of an allocation at 10 minutes, permissions expire after 5 minutes unless refreshed, and a client can talk to the server over UDP, TCP, TLS or DTLS.`, asOf:'2026-10-05', src:'https://www.rfc-editor.org/rfc/rfc8656.html' },
  { claim:`RFC 4787 requires a NAT’s UDP mapping to last at least two minutes without traffic and recommends five. Outbound traffic must refresh it.`, asOf:'2026-10-05', src:'https://www.rfc-editor.org/rfc/rfc4787.html' },
  { claim:`RFC 8445 (ICE) defines host, peer-reflexive, server-reflexive and relayed candidates, with recommended type preferences of 126, 110, 100 and 0 in that order, and tests candidate pairs with STUN binding checks.`, asOf:'2026-10-05', src:'https://www.rfc-editor.org/rfc/rfc8445.html' },
  { claim:`RFC 8200 requires every IPv6 link to have an MTU of at least 1,280 bytes, and IPv6 routers do not fragment packets.`, asOf:'2026-10-05', src:'https://www.rfc-editor.org/rfc/rfc8200.html' },
  { claim:`WebRTC data channels run over SCTP over DTLS over UDP, can be ordered or unordered and partially reliable, and all channels of one connection share one SCTP association and congestion window (RFC 8831).`, asOf:'2026-10-05', src:'https://www.rfc-editor.org/rfc/rfc8831.html' },
  { claim:`MDN lists WebTransport as Baseline 2026, newly available since March 2026 across current browsers, secure contexts only, with reliable streams and unreliable datagrams over HTTP/3. Check the compatibility table for your target browsers before relying on it.`, asOf:'2026-10-05', src:'https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API' },
  { claim:`Unity’s documentation says a Relay session supports up to 150 players joining the host, that the standalone Relay package is deprecated in Unity 6 in favour of the Multiplayer Services package, and that connection types are udp, dtls and wss. WebGL has no UDP, so DTLS relay is unavailable there.`, asOf:'2026-10-05', src:'https://docs.unity.com/en-us/mps-sdk/relay-limitations' },
  { claim:`Unity Transport’s reliable pipeline stage defaults to a window of 32 packets in flight (maximum 64) and its fragmentation stage assumes an MTU of roughly 1,400 bytes.`, asOf:'2026-10-05', src:'https://docs.unity3d.com/Packages/com.unity.transport@2.4/manual/pipelines-usage.html' },
  { claim:`Amazon GameLift’s player gateway is an opt-in relay that hides game server IP addresses, validates a token on all traffic and rate-limits each player. Enhanced DDoS Protection is on by default for fleets using Server SDK 5 and does not hide the server IP.`, asOf:'2026-10-05', src:'https://docs.aws.amazon.com/gameliftservers/latest/developerguide/ddos-protection-intro.html' },
  { claim:`Valve documents Steam Datagram Relay as preventing IP addresses from being revealed and protecting dedicated servers from denial-of-service attack, and says peer-to-peer connections are relayed over Valve’s backbone when appropriate. The GameNetworkingSockets README says SDR is not offered on other platforms to all partners.`, asOf:'2026-10-05', src:'https://partner.steamgames.com/doc/features/multiplayer/networking' }
]);
DIAGRAM('server-transport-and-relays', { kind:'flow', title:'ICE tries the cheapest path first and falls back to a relay',
  steps:[{id:'gather',t:'Gather candidates',d:'host, STUN and TURN addresses'},{id:'direct',t:'Try direct',d:'same network or open NAT'},{id:'punch',t:'Hole punch',d:'both send at once through NATs'},{id:'relay',t:'Relay',d:'TURN or a game relay carries it'},{id:'play',t:'Play',d:'keepalives hold the path open'}],
  edges:[['gather','direct'],['direct','punch'],['punch','relay'],['direct','play'],['punch','play'],['relay','play']],
  note:'Each step down is slower to set up, and the last always works. Relay traffic is paid for twice, in and out.' });
EXPLAINER('server-transport-and-relays', { kind:'explainer', title:'One lost packet: TCP stalls the stream, UDP keeps going',
  frames:[
    { t:'The server sends a snapshot every tick, 16 ms apart at 60 Hz, on two lanes', spec:{ kind:'matrix', rows:['TCP lane','UDP lane'], cols:['On the wire','The game shows'], cells:[['1 2 3 4 5 6','smooth movement'],['1 2 3 4 5 6','smooth movement']] } },
    { t:'Snapshot 3 is lost on both lanes', spec:{ kind:'matrix', rows:['TCP lane','UDP lane'], cols:['On the wire','The game shows'], cells:[['1 2 (lost) 4 5 6','snapshot 2'],['1 2 (lost) 4 5 6','snapshot 2']] } },
    { t:'TCP holds 4, 5 and 6 back until 3 arrives, and the character freezes', spec:{ kind:'matrix', rows:['TCP lane','UDP lane'], cols:['On the wire','The game shows'], cells:[['4 5 6 arrived, waiting for 3','frozen at snapshot 2'],['4 arriving','snapshot 2']] } },
    { t:'UDP uses 4 the moment it arrives', d:'The acknowledgement bits in the packet header show that 3 never arrived.', spec:{ kind:'matrix', rows:['TCP lane','UDP lane'], cols:['On the wire','The game shows'], cells:[['4 5 6 arrived, waiting for 3','frozen at snapshot 2'],['4 used on arrival','snapshot 4, one tick skipped']] } },
    { t:'The resend lands more than a round trip later, and TCP delivers in a burst', d:'About 200 ms at a 125 ms ping at best, by Glenn Fiedler\'s figure: about 12 snapshots late.', spec:{ kind:'matrix', rows:['TCP lane','UDP lane'], cols:['On the wire','The game shows'], cells:[['3, then 4 5 6 at once','a jump through old states'],['5 and 6 used as they arrive','smooth movement']] } },
    { t:'UDP repairs only what matters', spec:{ kind:'matrix', rows:['Snapshot 3','Event in packet 3'], cols:['Sent again?','Why'], cells:[['No','snapshot 4 already replaced it'],['Yes, in packet 6 and after, until acknowledged','an event happens once and must not be lost']] } },
    { t:'Both lanes side by side', d:'TCP: a gap, then a burst of old data. UDP: a one-tick skip, and the event repaired by sending it again.', spec:{ kind:'curve', x:'Time (one second)', y:'Lag behind the server', alt:'The TCP line spikes high for about 200 ms after the loss, then drops back; the UDP line barely moves.', series:[{ t:'TCP', pts:[[0,0.1],[0.3,0.1],[0.35,0.5],[0.5,0.9],[0.55,0.1],[1,0.1]] }, { t:'UDP', pts:[[0,0.1],[0.3,0.1],[0.33,0.18],[0.36,0.1],[1,0.1]] }] } }
  ] });

T('server-world-partitioning',{ d:'server', t:'Partitioning a world: shards, zones, instances and seamless servers', tag:'One process cannot hold everyone, so you cut the world. Every cut is a decision about who may meet whom, and what happens at the seam.',
  what:`How a game spreads one population over many processes. There are five families of cut. Shards or realms give each group of players its own copy of the world. Instances give a party its own copy of a small area. Layers duplicate the whole world, and zone sharding does the same for one busy zone; either way players are placed into whichever copy has room. Zone or grid servers cut one shared world into pieces by position and hand a player from one piece to the next. Match servers hold one short session, so there is nothing to cut. Each family answers four questions: who can see whom, where a player’s state lives, what crosses the seam, and what happens when one region gets crowded. The cost of the cut that matters most is a single cell that is too busy, because adding machines does not help a place that cannot be divided.`,
  why:[`A tick costs CPU in proportion to the pairs of things that can interact. 100 players in a match are about 5,000 pairs. 2,000 in one square are about two million pairs, 400 times the work, and the tick budget has not grown. Bandwidth grows the same way: if each of 2,000 players is sent the other 1,999 at 16 bytes and 20 Hz, that is about 1.3 GB per second, or 10 Gbit/s, out of one machine (illustrative figures; Epic’s Fortnite team targeted 100 players at 20 Hz on one server). Memory is the quietest term: at an illustrative 50 KB of state and 64 KB of connection buffers per player, 2,000 players hold about 230 MB before any world data, and it is all on the one machine that is already at its CPU limit. Interest management, in the bandwidth topic, cuts that, and it does not remove the pairwise CPU cost of crowds.`,`Players do not spread evenly. They gather at a capital, a launch-day starting zone, a battle or a market. The average load per machine tells you nothing. The load of the busiest cell tells you everything.`,`Every cut is a product decision. Shards decide who can be friends without a transfer. Instances decide whether a dungeon can be shared. Layers decide whether two people standing together see the same monsters. Infrastructure picks the cut and the design lives with it.`,`The seam is where the bugs are. An entity that crosses a boundary has to be owned by exactly one process at every moment, and the traffic of items, chat, trades and guilds does not respect your map.`],
  think:{ q:[`What is the largest number of players that must be able to see each other at once, and what does one process cost at that number?`,`Which cut does the game’s design already imply: a lobby and matches, a persistent world, or both?`,`Where does a character’s state live between sessions, and who owns it while the player is moving between two processes?`,`What happens at a boundary: can a player see across it, fight across it, and what stops them standing on it forever?`,`Which features have to work across the cut (chat, mail, auction house, guild, party, friends), and which service carries each?`,`What is the plan for the one cell that gets ten times its expected population?`],
    trade:[`Shards are the cheapest cut: unchanged code and a clean data boundary. The price is that a population is split for good, and an empty shard feels dead.`,`Instances give small groups a private, repeatable space and cost startup time, a queue and the rule that the world outside is not the world inside.`,`Layers absorb a launch crowd with no new code in the zones. They also let two friends in the same place see different worlds, and they invite layer-hopping to re-farm resource nodes, rare spawns and kills, which needs a rate limit on layer changes.`,`Static zone servers are simple and strand one process on a crowded zone. Dynamic region splitting follows the crowd and adds a hard handoff problem and a cost that grows with the border length.`,`A single shard keeps every player in one economy and one story and forces you to slow time or limit the fight when a crowd cannot be divided.`],
    traps:[`Assuming load follows population. A zone with a fifth of the average population, all standing in one square, is the one that falls over.`,`Handing off an entity at the exact boundary line. A player jittering over the line flips owners every tick, so use a margin (hysteresis) and a minimum time between handoffs.`,`Making the handoff a move rather than a protocol. If the old process deletes the entity before the new one has accepted it, a crash between the two loses the player. If both keep it, you have two.`,`Putting chat, trade and guild state inside the zone process, so they stop working across the seam and are lost when the zone restarts.`,`Treating a seamless-world platform as capacity you buy. It moves the difficulty to the border and to the densest cell, and it can end with the vendor.`,`Sizing a shard from an average concurrency number and forgetting the day-one peak and the evening peak.`],
    good:[`Each process owns a stated set of cells or entities, and the ownership table is the one place the answer lives.`,`There is a graph of player counts per cell, a number for where each cell becomes unplayable, and a rehearsed action for a cell that passes it.`,`A cross-shard feature is a service with its own store, not a zone call.`],
    bad:[`The only plan for a crowd is that the machine is large.`,`Boundaries are visible as freezes, rubber-banding or duplicated items.`] },
  how:[`Do the arithmetic for the worst moment, not the average. Take the number of players who may be in one space, work out pairs per tick, bytes per second and entities per process, and compare to what a single process holds in your load test. That number decides which family of cut you need.`,`Choose the cut from the design. A match game uses one match per process. A persistent world with a hub uses shards plus instances. A world meant to hold a crowd needs a plan for its densest cell before any plan for its average one.`,`Make ownership explicit. Keep a table from region or entity to the process that owns it, change it in one place only, and make every handoff go through that table.`,`Hand off in three steps: the old owner sends the entity and its state with a version, the new owner accepts and acknowledges, and only then does the old owner release it. If the acknowledgement does not arrive, the old owner keeps the entity and tries again.`,`Add a margin. An entity changes owner only after it is some distance beyond the border, and the neighbour sends read-only copies of entities within that margin so players see across the seam.`,`Split a hot region by load, not by area. Split along the median of entity positions so each half holds about half the entities, merge again when both halves fall below a lower threshold, and keep the two thresholds apart so a zone does not flap.`,`Move shared services out of the zone process. Chat, mail, trade, parties, guilds and the auction house sit behind services keyed by player or guild id, reachable from any shard, with their own persistence and idempotent operations.`,`Persist at the partition scale you chose. A character row belongs to one shard’s store, a guild or auction row to a service store, and a trade is a transaction across two of them with a log that survives a crash in the middle.`,`Rehearse the crowd. Load a test with hundreds of bots into one cell, and record the tick time, the handoff queue and the point where players notice. Decide in advance what you do at that point: cap the zone, slow time, or spill to a layer.`],
  ai:{ yes:[`Work through pairs per tick, bytes per second and entities per process for a described worst case, and show which term breaks first.`,`Review a handoff sequence for the crash points: old owner down, new owner down, message lost, message duplicated.`,`List which features in a described game must work across shards or zones and propose the service that carries each.`,`Draft the load test that puts a crowd in one cell and the metrics to record.`],
       no:[`Decide whether players of the same game may be separated. That changes what the game is, and the design team owns it.`,`Predict where your crowd will form. Your telemetry or a playtest shows it.`,`Declare a seamless design safe. Only the densest-cell test on your real topology does.`] },
  prompts:[{l:'Worst-cell arithmetic',p:`Our game has up to [N] players able to see each other in one space, a tick rate of [HZ], [BYTES] bytes per entity per update, and [ENTITIES] non-player entities. Compute pairs per tick, outgoing bytes per second and entities per process. Say which one breaks first on one process of [CORES] cores, then list three ways to cut it (partition, interest limit, simulation limit) with what each costs the design.`},
    {l:'Handoff failure review',p:`Our zone handoff goes: [STEPS]. For each step, say what happens if the sender crashes, the receiver crashes, the message is lost and the message is delivered twice. Name every case that loses a player or duplicates one, and rewrite the sequence so ownership is never held by zero or two processes.`}],
  verify:[`Is there exactly one owner for every entity at every moment, including during a handoff, a crash and a retry?`,`Does a player standing on a border for ten minutes trigger one handoff, or hundreds?`,`Can a trade, a guild invite and a chat message cross the cut, and survive a zone restart?`,`Has the densest realistic cell been tested, with its tick time and bandwidth measured?`],
  test:[`Place 500 bots in one cell and add 100 every minute. Record tick time and outgoing bandwidth per process, and find the count where a human playtester first calls it laggy.`,`Walk a bot back and forth across a border at the speed of your fastest mount. Count handoffs and look for lost items or duplicated entities.`,`Kill the receiving zone process in the middle of a handoff, then kill the sender. After each, check that the player exists once.`,`Run a cross-shard trade while one shard restarts, and check that the items exist in exactly one inventory afterwards.`],
  facts:[{claim:`CCP’s 2010 dev blog on Character Nodes, which explains part of EVE’s architecture, says solar systems are the unit of load balancing, that each is statically assigned to a node running on one CPU core, and that a heavily loaded system cannot be split across cores. It gave 204 “sol” nodes in the cluster and said Jita had been held at about 1,400 pilots until the Character Nodes change, deployed through August 2010.`,asOf:'2026-10-05',src:'https://www.eveonline.com/news/view/fixing-lag-character-nodes'},
    {claim:`CCP’s April 2011 dev blog that introduced Time Dilation described it as slowing the game clock according to the queue of work waiting on a node. It used illustrative figures of about 5 percent of real time during an extreme warp-in, about 30 percent at 1,600 pilots and about 60 percent at 1,200. It excluded events tied to real clock times such as reinforcement timers, called the plan tentative, and said a hard lower limit would be needed without saying where it would sit.`,asOf:'2026-10-05',src:'https://www.eveonline.com/news/view/introducing-time-dilation-tidi'},
    {claim:`In the live game, time dilation bottoms out at 10 percent of real time, so one game second takes ten real seconds. This figure comes from EVE University’s wiki, a player-run secondary source, and not from CCP’s 2011 post.`,asOf:'2026-10-05',src:'https://wiki.eveuniversity.org/Time_Dilation'},
    {claim:`Kristjan Valur Jonsson of CCP gave a GDC China 2010 talk titled “The Server Technology of EVE Online: How to Cope with 300,000 Players in One World”, whose abstract says the technology and the game were built around one unified world rather than many shards.`,asOf:'2026-10-05',src:'https://gdcvault.com/play/1014168/contactUs'},
    {claim:`Epic’s Unreal Engine tech blog on Fortnite Battle Royale says the dedicated server had to handle 100 simultaneous players, maintain 20 Hz and minimise bandwidth.`,asOf:'2026-10-05',src:'https://www.unrealengine.com/tech-blog/unreal-engine-improvements-for-fortnite-battle-royale'},
    {claim:`Amazon’s AWS blog on New World says each world simulates more than 7,000 AI entities and hundreds of thousands of objects for 2,500 players, over a grid in which each hub covers two non-contiguous grid sections, with state handed from hub to hub as players move and DynamoDB handling about 800,000 writes every 30 seconds.`,asOf:'2026-10-05',src:'https://aws.amazon.com/blogs/gametech/the-unique-architecture-behind-amazon-games-seamless-mmo-new-world/'},
    {claim:`Blizzard engineer Brian Birmingham said in an August 2019 Reddit AMA that each WoW Classic layer is a copy of the entire world, and that Blizzard was committed to reducing to one layer per realm before the second content phase.`,asOf:'2026-10-05',src:'https://us.forums.blizzard.com/en/wow/t/layering-in-classic-blizzard-responds-on-reddit/260714'},
    {claim:`Improbable said in August 2019 that three SpatialOS-based games had closed in three consecutive months, naming Worlds Adrift, Mavericks: Proving Grounds and Lazarus, and gave different reasons for each. The statement did not blame the platform.`,asOf:'2026-10-05',src:'https://www.pcgamesinsider.biz/news/69519/ambitious-visionary-products-always-contain-some-risk-says-improbable-after-third-spatialos-project-bites-the-dust/'},
    {claim:`The Agones documentation describes it as an open source platform on Kubernetes for deploying, hosting, scaling and orchestrating dedicated game servers, with allocation of a game server to a session.`,asOf:'2026-10-05',src:'https://agones.dev/site/docs/overview/'}],
  rel:[['server-scaling','Scaling covers the directory, drains and pub/sub that every partition scheme sits on. This topic is about where the world is cut.'],['server-matchmaking','A match-per-process game partitions by matchmaking, so placing a match is the whole cut.'],['infra-data-stores','Character, guild and auction data are partitioned with the world, and handoffs and trades are transactions over those stores.'],['multiplayer-design','Who can meet whom is a design choice before it is an infrastructure one.'],['server-bandwidth-and-interest-management','Interest management cuts the bytes a crowd costs. Partitioning cuts the CPU and memory that interest management cannot.'],['server-transport-and-relays','A handoff to another process is a new connection with its own address, handshake and path.']],
  tech:[
    {n:'Shards or realms', how:`Each realm is a full copy of the world with its own process group and database. Players pick one and stay on it. The code is the same on every realm.`, fit:`Persistent worlds where a few thousand to tens of thousands of players share a space and the economy is local.`, cost:`The population is split for good. A small realm feels empty, and a transfer is a data migration. Realms can later be joined: Blizzard connected realms from 2013, so guilds, trade and one auction house cover them. Blizzard chose this over merges to avoid forced name changes: characters keep their names, with a realm suffix as the namespace. Cross-realm zones are a lighter step, putting players of several realms into one zone instance without joining their data.`, alt:`One world with a hard concurrency limit and a queue.`},
    {n:'Instances', how:`A party or a match gets a private copy of a small area, started on demand from a template, with a lifetime and a capacity.`, fit:`Dungeons, raids, missions and any content that must not be contested.`, cost:`Startup time, a pool of idle copies, and a rule for what happens to a half-finished one.`, alt:`A shared open area with spawn contention.`},
    {n:'Layering and zone sharding', how:`The world (layering) or one busy zone (sharding) runs as several copies. A new player is placed into a copy with room, a party invite moves a player to the inviter’s copy, and the copies are folded back together as the crowd thins.`, fit:`A launch-day crowd, or a starting area that is dense for a week and empty for years.`, cost:`Two friends can stand together and see different worlds. A shared economy needs care so that duplicated resource nodes and kills do not duplicate wealth. Blizzard said each Classic layer is a copy of the whole world, that layering was how it handled launch demand, that it would be reduced to one layer per realm before the second content phase, and that Classic content was not designed for per-zone sharding. Blizzard also delayed layer changes to curb abuse.`, alt:`A queue at the door, which protects the experience and loses players.`},
    {n:'Phasing', how:`The server shows each player a version of the world chosen by that player’s state, such as quest progress, so two players in the same place can see different things. It is per-player state in the replication filter, not extra capacity.`, fit:`Story-driven areas where the world should change when a player completes a quest.`, cost:`Players in different phases cannot see or help each other, and the filter has to be right on every update or entities leak across phases.`, alt:`Instances for story scenes, which separate fully and cost startup time.`},
    {n:'Static zone servers with handoff', how:`The world is divided into fixed regions, each owned by one process. Entities cross at a border, with a margin so they do not flap, and the neighbour mirrors a strip of entities past the border for visibility.`, fit:`Open worlds with predictable density: a map with towns, roads and wilderness.`, cost:`The capital is the busiest process and cannot be divided further. The border needs a protocol and a test for every crash point.`, alt:`Instances for the dense content and a shard for the rest.`},
    {n:'Dynamic region splitting', how:`The load balancer measures entities or tick time per cell, splits an overloaded region at the median entity position into two owners, and merges two light neighbours back. The split and the merge use two different thresholds.`, fit:`Worlds where the crowd moves (sieges, events, world bosses) and the designers want no visible borders.`, cost:`Borders move and lengthen, so cross-process traffic rises exactly when load is highest. A very dense point still cannot be split below one cell.`, alt:`Cap how many players may enter a region, and accept the cap as the rule.`},
    {n:'Single shard with time dilation', how:`Each solar system is owned by one node. If the work queue on that node grows past what it can finish in a tick, the game clock slows, so everything in the system happens at a fraction of normal speed and every player is treated the same.`, fit:`A game whose identity is one shared universe, and whose rare mass fights matter more than their smoothness.`, cost:`A fight at 10 percent speed takes ten times as long. The player’s lag becomes a fairness rule instead of a dropped packet, and some systems tied to the real clock must be exempt.`, alt:`Hard population caps per system, which are fair and stop the fight from happening.`},
    {n:'One match per process', how:`A fleet of dedicated game servers is allocated one per match, lives for the match and is thrown away. A player is mapped to a match by the matchmaker. Orchestration (for example Agones on Kubernetes) handles the pool.`, fit:`Battle royale, arena and session games, where 100 or fewer players share a map for a limited time.`, cost:`No persistent world. State that outlives the match goes to a profile service and the cost scales with matches, not players.`, alt:`A persistent world, which costs more to run and offers more to be in.`},
    {n:'Cross-shard services', how:`Chat, mail, parties, guilds, trade and the auction house run as services keyed by id, with their own store, called from any shard or zone through a message bus.`, fit:`Any partitioned game with a social layer.`, cost:`Another system to run, with its own consistency rules: a trade across two characters on different shards is a transaction with a recovery log.`, alt:`Keep the social layer inside the shard, and accept that friends on other shards are unreachable.`}
  ] });
ENGINE('server-world-partitioning',{
  godot:{ term:`The client’s part in partitioning is the handoff. The server sends the address of the next zone and a one-use ticket, the client connects there, and the ticket goes through SceneMultiplayer’s authentication step, so the new zone checks it before the peer counts as connected.`,
    api:['ENetMultiplayerPeer.create_client()','MultiplayerAPI.multiplayer_peer','SceneMultiplayer.auth_callback','SceneMultiplayer.peer_authenticating','SceneMultiplayer.send_auth()','SceneMultiplayer.complete_auth()'],
    snippet:`extends Node

func on_handoff(host: String, port: int, ticket: String) -> void:
\tvar peer := ENetMultiplayerPeer.new()
\tif peer.create_client(host, port) != OK:
\t\treturn   # keep the old zone, retry with backoff
\tvar api := multiplayer as SceneMultiplayer
\tapi.auth_callback = func(id: int, _d: PackedByteArray) -> void: api.complete_auth(id)
\tfor c in api.peer_authenticating.get_connections():
\t\tapi.peer_authenticating.disconnect(c.callable)
\tapi.peer_authenticating.connect(api.send_auth.bind(ticket.to_utf8_buffer()))
\tapi.multiplayer_peer = peer   # replaces the old zone's peer`,
    pitfall:`Swapping the peer is break before make. The old zone sees the player vanish before the new zone has accepted them, so keep the ticket and the last address, retry with backoff, and have the server hold the entity until the ticket is redeemed or expires. The loop that disconnects the old handler keeps a retry from stacking a second send_auth on the same signal. Closing the old peer explicitly first gives the old zone a clean disconnect instead of a timeout; check that against your Godot version.`,
    map:`Unity’s Netcode for GameObjects has one NetworkManager, so the same handoff is a Shutdown, a new address and a connection payload carrying the ticket, which the server checks in connection approval.` },
  unity:{ term:`A handoff is a reconnect with a new address. The client shuts the connection down, points the transport at the next zone’s IPv4 address (the parameter is documented as an IPv4 address, so resolve any name first) and starts again with the ticket in the connection data.`,
    api:['NetworkManager.Singleton.Shutdown()','NetworkManager.ShutdownInProgress','NetworkConfig.ConnectionData','UnityTransport.SetConnectionData(string ipv4Address, ushort port)','NetworkManager.StartClient()'],
    snippet:`using System.Text;
using System.Threading.Tasks;
using Unity.Netcode;
using Unity.Netcode.Transports.UTP;

public static class ZoneHandoff {
    public static async Task Go(string host, ushort port, string ticket) {
        var nm = NetworkManager.Singleton;
        nm.Shutdown();
        while (nm.ShutdownInProgress) await Task.Yield();
        nm.NetworkConfig.ConnectionData = Encoding.UTF8.GetBytes(ticket);
        nm.GetComponent<UnityTransport>().SetConnectionData(host, port);
        nm.StartClient();   // the server approves by ticket
    }
}`,
    pitfall:`Calling StartClient straight after Shutdown. Shutdown finishes later, and a start during it fails or attaches to the old session. Wait for ShutdownInProgress to clear, then connect, and keep the ticket so a failed connect can be retried.`,
    map:`Godot swaps the multiplayer peer on the same MultiplayerAPI and presents the ticket with an RPC; Unity restarts the NetworkManager and presents it in connection data.` },
  note:`Seamless worlds hide the handoff behind a loading-free transition. The protocol underneath is still: server names the next owner, client connects with a ticket, the new owner accepts, the old owner releases. Clients should treat the zone address as short-lived, as in the scaling topic.` });
GO('server-world-partitioning', {
  api:['math.Floor','slices.Clone','slices.Sort'],
  snippet:`package zones

import (
	"math"
	"slices"
)

type Cell struct{ X, Y int }

type Grid struct {
	Size   float64 // cell edge in world units
	Margin float64 // distance past the border before a handoff
}

func (g Grid) CellOf(x, y float64) Cell {
	return Cell{int(math.Floor(x / g.Size)), int(math.Floor(y / g.Size))}
}

// Owner keeps an entity in its current cell until it is Margin past the border,
// so a player standing on the line does not change owner every tick.
func (g Grid) Owner(cur Cell, x, y float64) Cell {
	lo := func(c int) float64 { return float64(c) * g.Size }
	if x >= lo(cur.X)-g.Margin && x < lo(cur.X+1)+g.Margin &&
		y >= lo(cur.Y)-g.Margin && y < lo(cur.Y+1)+g.Margin {
		return cur
	}
	return g.CellOf(x, y)
}

// SplitAt returns the x position that gives each half about half the entities.
// It is called only for a region that is over its load limit, so xs is not empty.
func SplitAt(xs []float64) float64 {
	s := slices.Clone(xs)
	slices.Sort(s)
	return s[len(s)/2]
}
`,
  pitfall:'Handing off at the exact border, so a player on the line flips owner every tick. Keep the margin, and also rate-limit handoffs per entity. The ownership change must be acknowledged by the receiver before the sender releases the entity.'
});
INTERVIEW('server-world-partitioning',{
  junior:[
    { q:`Why can a single game server process not hold every player of a popular online game?`,
      a:`Three costs grow with the crowd. CPU per tick grows with the number of pairs that can interact, so 20 times the players in one square is about 400 times the pair work. Bandwidth grows the same way, because each player is sent the others. Memory grows with the entities. The tick budget does not grow, so past some count the tick overruns. Give a number: 100 players are about 5,000 pairs and 2,000 are about two million.`,
      follow:`Which of the three would you measure first, and how?`,
      red:`Says “add more RAM” or “a bigger server”, without saying which resource runs out first.` },
    { q:`What is the difference between a shard (realm) and an instance?`,
      a:`A shard is a persistent copy of the whole world with its own population and database, chosen once and kept. An instance is a temporary private copy of a small area, started for a party or a match and thrown away. Shards split a community, instances give a group exclusive content.`,
      follow:`A friend is on another shard. What can you do about that?`,
      red:`Treats them as the same thing under different names.` },
    { q:`Why do games run one match per server process for battle royale and arena modes?`,
      a:`A match has a fixed, small population (100 or fewer in the Fortnite case), a short life and no state that must outlive it. So there is nothing to divide: one process per match, allocated from a pool, and the scaling is the number of matches. State that persists, like profile and inventory, lives in services.`,
      follow:`What does that approach give up compared with a persistent world?`,
      red:`Proposes shards and zones for a 100-player match.` }
  ],
  mid:[
    { q:`Walk me through handing a player from one zone server to another so the player is never lost or duplicated.`,
      a:`The old owner sends the entity with its state and a version to the new owner. The new owner accepts and acknowledges. Only then does the old owner release it. If the acknowledgement is lost, the old owner keeps the entity and retries with the same version so the receiver can ignore a repeat. Add a margin around the border and a minimum time between handoffs. Talk through each crash point.`,
      follow:`The receiver crashes after accepting and before acknowledging. What does the sender do?`,
      red:`Deletes on send, or describes the handoff as a copy with no acknowledgement.` },
    { q:`Players report that the capital city lags every evening while the rest of the world is fine. Which partition choices help, and which do not?`,
      a:`Adding machines does not help, because the capital is one cell owned by one process. Choices: cap or layer the capital, move activity into instances (auction house, crafting), split the region dynamically if the design has no hard borders, and reduce per-player cost with interest management. Say that the real fix may be a design cap, and give how you would measure the cell’s tick time.`,
      follow:`How would you choose between a cap and a layer?`,
      red:`Proposes more zone servers with no way to divide the busy one.` },
    { q:`How do chat, trading and guilds work in a game split into shards or zones?`,
      a:`They are services, keyed by player or guild id and reachable from any process, with their own storage. Zones keep only what needs a tick. A trade is a transaction over two stores, written as a log with idempotent steps so a crash in the middle can be resumed. Chat uses pub/sub channels per guild or party.`,
      follow:`What happens to a trade if the zone holding one player restarts mid-way?`,
      red:`Keeps guild and trade state in the zone process memory.` }
  ],
  senior:[
    { q:`EVE keeps one shard and slows time on an overloaded system. Under what conditions would you choose that over layering or caps, and what does it cost?`,
      a:`It fits when the game’s identity is one shared universe and rare mass fights justify the cost. Each system sits on one node, so a hot system cannot be split. Time dilation turns an overrun tick into a slower clock, so every participant is treated the same and nothing is dropped; CCP’s 2011 post gave illustrative figures of about 30 percent at 1,600 pilots and said a hard limit would be needed without fixing it; the live game bottoms out at 10 percent. The costs: a fight lasts many times longer, real-clock events must be exempt, and the player experience is slow motion. Contrast with layering, which breaks shared reality, and a cap, which prevents the fight.`,
      follow:`What do you change about the game if the floor is reached and the node still cannot keep up?`,
      red:`Calls time dilation lag compensation, or says a bigger server removes the need.` },
    { q:`A vendor pitches a seamless-world platform that promises 20,000 players in one world. What do you ask before you commit?`,
      a:`Ask for the densest-cell number, not the total. Ask what happens at a border, how ownership changes and who recovers from a handoff crash, what the cost is per hour at your concurrency, what engine and licence terms you rely on, and what you do if the vendor changes. Use history: three SpatialOS-based games closed in three consecutive months in 2019 for different reasons, and a January 2019 dispute in which Unity said SpatialOS games on Unity were in breach of its terms showed the platform risk. The sources give business and licensing reasons, not a measured technical limit, so say that. Build the dense case yourself in a small test before you sign.`,
      follow:`Which two numbers would you want in the contract or the proof of concept?`,
      red:`Accepts a total-player number as capacity.` },
    { q:`Design the partitioning for an open-world game that expects 2,500 players per world with a large event at one location.`,
      a:`Use the New World style as a reference, as reported by AWS: a grid, hubs each covering two non-contiguous grid sections, state handed hub to hub, and a store with fast writes. AWS does not give the reason for non-contiguous sections; my reading is that it keeps one crowded area from landing on one machine, which is an inference. Add what that doesn’t solve: the event cell. Set a per-cell simulation budget, plan an interest radius and a cap, and put the event in an instance or phase if the design allows. Split by median entity position when over load and merge with hysteresis. Persist character state per shard and put social features in services. Test the event cell with bots.`,
      follow:`What do you do when the event cell is still too heavy?`,
      red:`Splits by equal area and assumes load follows area.` },
    { q:`How would you move a live game from five realms to a connected-realm model?`,
      a:`Merging databases means key collisions (character names, guild names, item ids), economy effects (prices from two markets merge) and rollback risk. Blizzard avoided forced renames: characters kept their names, with a realm suffix as the namespace. Plan: pick realms by population and time zone, namespace names or offer renames, merge in a window with backups and a rehearsal on a copy, and merge auction data last. Say what players gain (guilds, one auction house) and what they risk (a crowded market).`,
      follow:`How do you roll back if the merge produces duplicate items?`,
      red:`Describes a merge as pointing two realms at one world, without the data work.` }
  ] });
DIAGRAM('server-world-partitioning', { kind:'matrix', title:'Five ways to cut a world, and what each one costs',
  rows:['Shards or realms','Instances','Layers','Zone servers and handoff','One match per process'], cols:['Who can meet','What it costs'],
  cells:[['Players of the same realm','The population is split for good'],['A party or match in a private copy','Startup time and a different space'],['Players placed into the copy with room','Friends can see different worlds'],['Everyone, with an owner per region','A hot cell cannot be divided, and borders need a protocol'],['The players of one match','No persistent world; state goes to services']] });
EXPLAINER('server-world-partitioning', { kind:'explainer', title:'A zone splits as players crowd in, and the border moves with them',
  frames:[
    { t:'One zone, one process, calm', d:'Illustrative numbers throughout.', spec:{ kind:'matrix', rows:['Zone A'], cols:['Players','Tick time (share of budget)'], cells:[['40','30%']] } },
    { t:'The crowd gathers in one corner', spec:{ kind:'matrix', rows:['Zone A'], cols:['Players','Tick time (share of budget)'], cells:[['400, packed into the south-west corner','95%']] } },
    { t:'Past the limit: the tick overruns its budget and the corner stutters', spec:{ kind:'curve', x:'Players in the zone (0 to 700)', y:'Tick time (x budget, 0-1.5)', alt:'Tick time rises with the crowd and crosses the budget line at about 420 players.', band:{ t:'over budget', from:0.667, to:1 }, series:[{ t:'Tick time', pts:[[0,0.05],[0.06,0.2],[0.57,0.63],[1,0.93]] }] } },
    { t:'Split at the median of the crowd, and start a second process', d:'Each side now holds about 350 players.', spec:{ kind:'screen', aspect:'4:3', regions:[{ t:'Zone A, process 1', d:'350 players', kind:'world', x:0, y:0, w:0.49, h:1 }, { t:'Zone B, process 2', d:'350 players', kind:'world', x:0.51, y:0, w:0.49, h:1 }] } },
    { t:'Hand off with a margin', d:'A player crossing the line stays with the old owner until Zone B acknowledges it, then the old owner lets go.', spec:{ kind:'screen', aspect:'4:3', regions:[{ t:'Zone A', kind:'world', x:0, y:0, w:0.41, h:1 }, { t:'Handoff margin', d:'players near the line are copied to both zones', kind:'world', x:0.42, y:0, w:0.16, h:1 }, { t:'Zone B', kind:'world', x:0.59, y:0, w:0.41, h:1 }] } },
    { t:'Both halves are healthy, and the border has a running cost', spec:{ kind:'matrix', rows:['Zone A','Zone B'], cols:['Tick time (share of budget)','Messages across the border'], cells:[['55%','rising with the crowd at the line'],['55%','rising with the crowd at the line']] } },
    { t:'The crowd leaves, but the zones stay split', d:'The merge threshold is set well below the split threshold, so a crowd that drifts back does not make the border flap.', spec:{ kind:'matrix', rows:['Zone A','Zone B','Split above','Merge below'], cols:['Players','Tick time (share of budget)'], cells:[['60','26%'],['60','26%'],['','90%'],['','20%']] } },
    { t:'Merge when both are light', d:'The border is removed and one process runs the whole zone again.', spec:{ kind:'matrix', rows:['Zone A (merged)'], cols:['Players','Tick time (share of budget)'], cells:[['70','28%']] } }
  ] });

T('server-load-testing-and-capacity',{ d:'server', t:'Load testing and capacity planning', tag:'"Fine with 10 users" predicts nothing about 100,000. Generate load the way players arrive, push past the break, and turn what you measured into a number you can buy.',
  what:`Finding out, before launch day, how many players a server can carry and what it does when there are more. It has four parts. A load generator that behaves like players (headless bots, replayed traffic, mock backends). A test plan that shapes the load: ramp, soak, spike and breakpoint. A short list of measurements that show the first resource to saturate: tick time at the 99th percentile, memory per room, connections, database queries per second, error rate. And a capacity model that turns those into players per core and cost per concurrent user, with headroom for the failures you also tested. Overload behaviour is part of the job: a server that sheds excess load cleanly is a better product than one that is a little faster and collapses.`,
  why:[`Load is not linear. Queues, locks, connection pools, file descriptors and garbage collection each have a knee, and past it latency does not rise a little, it rises without bound. A test at one tenth of the target cannot see any of them.`,`Little’s law says the number of things in the system is arrival rate times time in the system. When time in the system doubles because a dependency slows, in-flight work doubles with it, and every pool and queue sized for the old number is now full.`,`Launch day is the one test you cannot rerun. Real launches have beaten their own worst-case estimate by a wide margin: one published case surged to 50 times its planning target and 10 times its worst-case estimate.`,`Capacity is money. Players per core and cost per concurrent user decide the price of a free-to-play player, so the number has to come from a measurement, not a guess.`,`Most outages are not the first fault. They are the retry storm, login stampede or garbage-collection spiral that the first fault set off. Those only appear when you test past the limit and test the recovery.`],
  think:{ q:[`What is the first resource that will saturate: CPU on the tick thread, memory per room, file descriptors, a connection pool, the database, or the network?`,`Does my load generator send at a rate I choose, or does it slow down when the server slows down?`,`What do real players do at the start of a session that bots will not, and how much load does it cause?`,`What happens to the 100,001st player: a clean refusal, a queue, or a slow collapse for everyone?`,`If every client lost its connection at the same instant, how many reconnect attempts would arrive in the first second?`,`How long does it take new capacity to become ready, and how much buffer covers that gap?`,`What is the load at which I want an alarm, and how far is that from the load that breaks the server?`],
    trade:[`A faithful full game client as the bot finds client-side cost and logic bugs and often costs a large share of a core per bot (a rule of thumb, not a published figure). A protocol-level bot can run thousands per core and skips everything the real client does between messages.`,`Testing in production sees the real network, database size and cache state and risks players. A staging copy is safe and is smaller, emptier and warmer than the real thing.`,`A generous capacity buffer keeps wait times near zero and you pay for idle machines. A thin buffer is cheap and the next surge becomes a queue.`,`Replaying recorded traffic is realistic by construction and goes stale as the protocol changes and as the state it assumed (tokens, ids, inventory) no longer exists. Scripted scenarios stay maintainable and only cover the paths you thought of.`,`Shedding load early protects the players you accepted and visibly refuses some. Accepting everything looks generous until nobody gets served.`],
    traps:[`A closed-loop generator: each virtual user waits for its reply before sending again, so when the server stalls the generator sends less, hides the stall and reports a flattering p99. This is coordinated omission.`,`The load generator is the bottleneck. A generator machine at 100 per cent CPU, or with its ephemeral ports used up, measures itself.`,`Averages. A mean tick time of 4 ms hides the 80 ms tick that every player felt as a hitch. Look at p99 and the maximum, per tick, not per minute.`,`Testing only the hot path. Bots that log in and sit in a lobby miss matchmaking, inventory writes, chat and the end-of-match results burst.`,`Linear extrapolation: one instance carried 2,000 players, so ten will carry 20,000. Shared databases, pub/sub nodes and matchmaker queues do not scale with the instance count.`,`Retrying without a budget or jitter, so a ten-second outage becomes a thirty-minute one as every client retries in step.`,`A test that always passes. If you never found the point where it breaks, you have not found the capacity.`,`Testing from inside the same cloud region and network as the server, so packet loss, latency and slow-client buffering never occur.`],
    good:[`There is a written capacity number per instance type, with the test that produced it, the date and the build.`,`The team has seen the server overloaded on purpose, knows what the symptoms look like on the dashboard and knows what recovery looks like.`,`Reconnect and retry code has a cap, a budget and jitter, and a test proves it.`],
    bad:[`The capacity number is a round figure someone said in a meeting.`,`The first time the servers saw real load was the open beta.`] },
  how:[`Write down the target in the units that matter: concurrent players at peak, logins per second in the first ten minutes, matches started per second. Take the launch estimate, multiply by the worst-case factor you can defend, then ask for a plan for 10 times that: the margin is a budget decision.`,`Build the load generator to send at a chosen arrival rate (an open model). In k6 that is the constant-arrival-rate or ramping-arrival-rate executors; in Gatling, constantUsersPerSec and rampUsersPerSec. Use VU-based closed models only to hold a number of concurrent sessions.`,`Write the bot as a protocol client first: connect, authenticate, join a room, send inputs at the real rate, record round trips. Add a headless real client (Godot --headless, Unity -batchmode -nographics) for a smaller second run to catch client logic and asset costs.`,`Start with a smoke test of one bot, then one room. Then climb by doubling: 1,000, 2,000, 4,000 players. Fix the first thing that fails and rerun. Riot’s load-test programme for VALORANT doubled the simulated player count after each passing run.`,`Run the four shapes. Ramp to the expected peak and hold for 30 to 60 minutes. Soak at average load for hours to find leaks and slow growth. Spike: jump to several times peak for a few minutes and watch the recovery. Breakpoint: keep ramping until goodput stops growing, then drop the load and watch how long recovery takes.`,`Record per run: tick time p50, p99 and max; players per room; CPU per instance; resident memory per room and after rooms close; open connections and file descriptors; packet loss and retransmits; database queries per second and slow-query count; error rate by type; queue depth at the matchmaker and login service.`,`Find the knee. Plot p99 tick time against players per instance: it is flat, then it bends. The capacity is a point comfortably left of the bend, not at it. A common starting point is the load at which tick time p99 reaches about 60 to 70 per cent of the tick budget.`,`Turn it into a model. Players per core = (tick budget × target utilisation) ÷ CPU cost per player per tick, measured at the target room size, because per-player cost rises with room size. Cost per concurrent user per hour = instance price per hour ÷ (players per instance). With illustrative numbers: an instance at 0.40 dollars an hour carrying 800 players costs 0.0005 dollars per concurrent user per hour. Add the instances you need to lose one zone and keep serving.`,`Add overload behaviour on purpose: cap concurrent sessions per instance, refuse new rooms with a clear error and a retry-after hint when full, bound every queue, and drop the least important work first. Then test that this works at 2 times and 5 times capacity.`,`Put jitter in every retry and reconnect path, with a retry budget. Add a login queue or admission rate in front of the first expensive call. Test the stampede: drop every connection at once and count the reconnects per second. Name it for what it is: a thundering herd.`,`Check the operating-system limits before blaming the server. One generator IP to one server IP and port gets at most about 28,232 ephemeral ports (60999 - 32768 + 1 under the Linux default range), so spread the generator across source IPs or ports. A listen backlog overflows at net.core.somaxconn (4096 since Linux 5.4), and a per-process descriptor limit set too low fails with EMFILE: raise ulimit -n, bounded by /proc/sys/fs/nr_open.`,`For a garbage-collected server, chart GC pause time in the soak. In Go, GOGC defaults to 100 and GOMEMLIMIT (Go 1.19) caps runtime memory; a limit set below the real peak makes the program thrash in near-constant collection, so set it with headroom above the measured peak.`,`Make the test repeatable. Check the generator scripts, the scenario files and the pass/fail thresholds into the repo and run a short version on each release candidate. Keep the full test for each major release and each time the server architecture changes.`,`Do a rehearsal for launch: dark-launch the real client to a few thousand people, or run an open beta whose purpose is the load, and keep the readouts from it next to the model.`],
  ai:{ yes:[`Turn a described tick loop and room size into a players-per-core estimate and show the arithmetic and the assumptions.`,`Write a k6, Locust or Gatling scenario for a given protocol, using an open arrival model and thresholds on p99. In Locust, users are closed-loop by default; constant_throughput only paces each user, and poisson wait times approximate arrivals but still need enough users.`,`Review a reconnect routine for jitter, caps, retry budgets and the case where every client retries at once.`,`Compare a load-test report against the dashboard and list which saturation signal is missing.`,`Draft a chaos experiment: hypothesis, steady-state metric, blast radius and abort condition.`],
       no:[`Tell you your capacity. Only a test on your build and your hardware produces that number.`,`Choose the safety margin. That is a cost and risk decision for the people who pay for the machines and carry the pager.`,`Declare a test valid. Whether the bots behave like players has to be checked against production telemetry.`] },
  prompts:[{l:'Capacity arithmetic',p:`Our server runs rooms of [N] players at [HZ] ticks per second. One room costs [MS] ms of one core per tick at the 99th percentile in a test on [HARDWARE]. We want [UTIL] per cent maximum core utilisation. Compute rooms per core, players per instance with [CORES] usable cores, and instances for [CCU] concurrent players with one availability zone lost. Show every step, then list the three assumptions that would most change the answer and the measurement that would pin each one down.`},
    {l:'Open-model test plan',p:`Here is our player flow: [FLOW]. Write a load test plan with five phases: smoke, ramp to peak, soak, spike and breakpoint. For each give the arrival rate or concurrent sessions, the duration, the metrics to capture, the pass threshold and the thing it is most likely to expose. Flag any step where a closed-loop generator would hide a stall.`},
    {l:'Reconnect storm review',p:`This is our client reconnect code: [CODE]. List every way it can cause a synchronised retry storm after a server restart. Propose a backoff with full jitter, a cap and a retry budget. Say what the server should return so clients can back off sensibly, and how I would test it with [N] simulated clients.`}],
  verify:[`Does the generator keep its send rate when the server slows down? Stall the server for 10 seconds and look for a gap in the generator’s sends and a matching hole in the latency histogram.`,`As a rule of thumb, is the generator itself below about 70 per cent CPU and well under its connection and port limits during the run?`,`Is there a recorded breakpoint: the load at which goodput stops growing, with the signal that showed it first?`,`After a spike, does the system return to its normal p99 on its own, and how long does it take?`,`At 2 times the tested capacity, does the server refuse the extra sessions cleanly while the accepted ones keep their tick time?`,`Do reconnects use jitter and a cap, and does dropping all connections at once stay under the login service’s tested rate?`,`Does resident memory per room return to baseline after rooms close, over an eight-hour soak?`],
  test:[`Run a breakpoint test with an arrival-rate generator on one instance. Plot goodput and p99 tick time against load, mark the knee, and record the order in which resources saturated.`,`Stall the server for ten seconds with a closed-loop and then an open-loop generator and compare the p99 each one reports. The difference is the size of the error closed-loop testing hides.`,`Kill 100 per cent of connections at once and watch the first 60 seconds of reconnect attempts per second, with and without jitter.`,`Soak for eight hours at average load. Chart memory per room, GC pause time and open file descriptors for a trend.`,`Fail one instance, one database replica and one zone in a rehearsal, with a stated hypothesis for each, and compare the result with the hypothesis.`],
  rel:[['server-scaling','That topic is the architecture being tested here: sessions per instance, drains and fan-out are the numbers a load test has to produce.'],['server-matchmaking','Matchmaking queues and room allocation are the first thing a login stampede reaches, and the queue-depth curve is a main output of the test.'],['infra-monitoring','The tests are only as good as the dashboards that read them, and the same signals become the production alerts.'],['backend-testing','The test tiers in that topic end at integration; this one covers the load tier and overload behaviour they leave out.'],['server-liveops','Events, patches and scheduled resets make the traffic spikes the capacity plan must survive.'],['server-bandwidth-and-interest-management','Bandwidth per player is one of the main per-player costs the capacity model multiplies, and a load test is where its estimate is checked.'],['server-transport-and-relays','Connection setup, relay capacity and packet loss behaviour change what the generator must simulate and where the first limit appears.'],['server-world-partitioning','Partitioning is how you act on a capacity result: it cuts one world into units you can load-test and buy separately.']],
  tech:[
    {n:'Open-model arrival rate', how:`Start new sessions at a fixed rate (constant-arrival-rate in k6, constantUsersPerSec in Gatling), whatever the server answers. Latency is measured from the intended start.`, fit:`Login, matchmaking and any public entry point where players arrive on their own schedule.`, cost:`If the server cannot keep up, the number of in-flight sessions grows without limit and can crash the generator, so set a ceiling on virtual users.`, alt:`A closed model with a fixed number of virtual users, which suits steady concurrent sessions and hides stalls because the generator slows down with the server.`},
    {n:'Protocol-level bots', how:`A small program (Go, Python with gevent, Node) speaks the wire protocol directly, sends inputs at the real tick rate and logs round trips. For scale, Riot’s platform harness, which made service calls (party, matchmaking, store) rather than gameplay inputs, ran about 10,000 simulated players per process on four CPUs; budget far fewer tick-rate input streams per core.`, fit:`The main capacity run; thousands of players per generator machine.`, cost:`It skips client logic, asset loading and rendering, and it must be kept in step with the protocol.`, alt:`Headless real clients (Godot --headless, Unity -batchmode -nographics), which are faithful and cost far more CPU per bot.`},
    {n:'Mock game servers and mock backends', how:`Replace the tier you are not testing with a stub that answers like the real one. Riot’s mock game server emulated provisioning for over 500 games per core, so the services around it could be tested at scale without real match servers.`, fit:`Testing one tier (login, matchmaking, party service) far beyond the capacity of the real tier behind it.`, cost:`The mock’s timing is your guess. If it is faster than the real thing, the test is too kind.`, alt:`The full stack, which is true to life and rarely affordable at launch scale.`},
    {n:'Recorded-traffic replay', how:`Capture real sessions at the gateway, rewrite the identifiers and tokens, and replay them at the chosen rate.`, fit:`A live game with traffic to copy, and a protocol change you want to check against real behaviour.`, cost:`Captures are state-dependent: items, rooms and tokens must exist, and a replay writes to the database.`, alt:`Scripted scenarios that you write from the player flow, which are cleaner and miss odd paths.`},
    {n:'Doubling ladder', how:`Run the same test at 1x, 2x, 4x, 8x the previous passing load; fix the first failure at each step before doubling.`, fit:`Any first load-test programme.`, cost:`Each doubling can hit a new bottleneck, so the calendar time is long; Riot reached its two-million target less than two weeks before launch.`, alt:`One huge test, which finds the first bottleneck only and hides the next five behind it.`},
    {n:'Breakpoint and recovery test', how:`Ramp the arrival rate until goodput stops rising or errors cross a threshold, then cut the load and time how long p99 takes to come back.`, fit:`Setting the capacity number, and finding out whether the overload behaviour is graceful.`, cost:`It deliberately breaks the target, so it needs a dedicated environment and cannot run in a shared CI.`, alt:`Staying under the expected peak, which says nothing about the failure mode.`},
    {n:'Adaptive client throttling and retry budgets', how:`The client tracks requests and accepts over a window. Once requests exceed K times accepts (Google uses K=2) it starts rejecting some locally. Retries are limited per request (about three attempts) and per client (retries under about 10 per cent of requests).`, fit:`Every client library that talks to a login, matchmaking or inventory service.`, cost:`Throttled players see errors sooner, and the thresholds need tuning against real traffic.`, alt:`Retry with no limit, which turns a brief overload into a long outage.`},
    {n:'Full-jitter backoff', how:`Sleep a random time between 0 and min(cap, base × 2^attempt) before each retry. In AWS’s simulation of 100 contending clients, full jitter cut the calls by more than half against exponential backoff without jitter.`, fit:`Reconnect, login and any retry loop with many clients.`, cost:`Some sleeps are very short, so some clients retry almost at once, which a slow-to-recover service still feels; equal jitter keeps a minimum wait at the cost of longer completion.`, alt:`Fixed or pure exponential delays, which keep the herd in step.`},
    {n:'Chaos experiments with a small blast radius', how:`State the steady-state metric and a hypothesis, inject one real-world fault (kill an instance, add latency, drop a database replica), and abort on a stated condition.`, fit:`Once the system has autoscaling, failover and drains that you want to trust.`, cost:`It needs good dashboards and an agreed abort rule, and it needs the team to accept real risk.`, alt:`Reading the failover documentation and hoping.`},
    {n:'Capacity buffer scaling', how:`Keep a fraction of session slots free so new players start in seconds. GameLift’s target-based scaling holds a PercentAvailableGameSessions buffer; Agones’ Buffer policy (one of several FleetAutoscaler policies) keeps a bufferSize of Ready game servers and checks every 30 seconds by default.`, fit:`Games with spiky arrival and instance start times of minutes.`, cost:`You pay for the idle buffer; a surge bigger than the buffer still queues.`, alt:`Scheduled scaling for known events, which is cheap and blind to surprises.`}
  ] });
ENGINE('server-load-testing-and-capacity',{
  godot:{ term:`The engine’s share of load testing is the bot. Godot can run a project with no window and no audio, so one scene can be a cheap player: it connects, sends inputs at the physics rate and records the round trip.`,
    api:['WebSocketPeer.connect_to_url()','WebSocketPeer.poll()','WebSocketPeer.get_ready_state()','WebSocketPeer.get_available_packet_count()','Engine.get_physics_frames()','Time.get_ticks_msec()'],
    snippet:`extends Node                   # godot --headless --path bot
var ws := WebSocketPeer.new()
var sent := {}                 # grows if replies are lost; prune in real use
func _ready() -> void:
\tws.connect_to_url("ws://127.0.0.1:9000/play")
func _physics_process(_d: float) -> void:
\tws.poll()
\tif ws.get_ready_state() != WebSocketPeer.STATE_OPEN: return
\tvar n := Engine.get_physics_frames()
\tsent[n] = Time.get_ticks_msec()
\tws.send_text(str(n))               # sends at the tick rate, never waits for a reply
\twhile ws.get_available_packet_count() > 0:
\t\tvar ack := int(ws.get_packet().get_string_from_utf8())
\t\tprint("rtt_ms ", Time.get_ticks_msec() - sent.get(ack, 0))
\t\tsent.erase(ack)`,
    pitfall:`Running hundreds of full Godot bots on one machine and calling the result a server limit. Each headless instance still runs a scene tree and physics, so the generator saturates long before the server does. Run one bot per process only to compare with real clients, and use a protocol bot in Go or Python for the capacity run. Also check the physics tick: the loop above sends at the project’s physics rate, which is 60 per second by default and may be far above the real client’s input rate.`,
    map:`Unity’s headless run is -batchmode -nographics, which does the same job, and a plain console program does it with no engine at all.` },
  unity:{ term:`A Unity bot is a built player started with -batchmode -nographics. The part worth writing in the engine is the reconnect routine, because the real client has the same one and it is the code that makes a stampede.`,
    api:['ClientWebSocket.ConnectAsync(Uri, CancellationToken)','Task.Delay(TimeSpan, CancellationToken)','MonoBehaviour.destroyCancellationToken','Object.GetInstanceID()','System.Random.NextDouble()','Math.Min / Math.Pow'],
    snippet:`public class Bot : MonoBehaviour {
    System.Random rng;
    void Awake() => rng = new(GetInstanceID()); // distinct seed per bot
    public async Task<ClientWebSocket> Join(Uri url) {
        for (int attempt = 0; ; attempt++) {
            var ws = new ClientWebSocket();
            try { await ws.ConnectAsync(url, destroyCancellationToken); return ws; }
            catch (WebSocketException) { ws.Dispose(); }
            double cap = Math.Min(30.0, 0.5 * Math.Pow(2, attempt));
            // full jitter: a random wait between 0 and the capped exponential
            await Task.Delay(TimeSpan.FromSeconds(rng.NextDouble() * cap), destroyCancellationToken);
        }
    }
}`,
    pitfall:`Sharing one System.Random across threads in a bot swarm: Random is not thread-safe, and concurrent use corrupts its state so it can return zeros, and every bot then retries at once. Seeding every bot with the same value also keeps the herd in step. Keep one generator per bot, seeded from something distinct, as the snippet does. Also note that a bot that retries forever hides the failure rate: log each attempt, so the retry count appears in the test report.`,
    map:`Godot’s equivalent is a Timer or an await get_tree().create_timer(wait).timeout with the same randomised wait; the algorithm is engine-independent.` },
  note:`Load testing is a server topic. The engine contributes two things: a headless client mode for the second, smaller, faithful run, and the client’s own reconnect and retry code, which decides how a real stampede looks. Test that code with the bot, not just the server.` });
GO('server-load-testing-and-capacity', {
  api:['time.Until','time.Since','sync.WaitGroup','sort.Slice'],
  snippet:`package main

import (
	"fmt"
	"sort"
	"sync"
	"time"
)

// call stands in for one request or tick round trip to the server under test.
func call() { time.Sleep(5 * time.Millisecond) }

func main() {
	const rate = 200 // intended arrivals per second, fixed whatever the server does
	const total = 400
	interval := time.Second / rate
	start := time.Now()
	var mu sync.Mutex
	var wg sync.WaitGroup
	sem := make(chan struct{}, 1000) // caps goroutines in flight
	lat := make([]time.Duration, 0, total)
	for i := 0; i < total; i++ {
		intended := start.Add(time.Duration(i) * interval)
		time.Sleep(time.Until(intended))
		sem <- struct{}{}
		wg.Add(1)
		go func() {
			defer func() { <-sem; wg.Done() }()
			call()
			d := time.Since(intended) // from the intended time, not from when we got round to it
			mu.Lock()
			lat = append(lat, d)
			mu.Unlock()
		}()
	}
	wg.Wait()
	sort.Slice(lat, func(a, b int) bool { return lat[a] < lat[b] })
	fmt.Println("p99:", lat[len(lat)*99/100])
}
`,
  pitfall:'Measuring latency from the moment the request was sent. When the server stalls, a closed-loop generator sends later, so its timer starts later and the stall disappears from the p99. Start the clock at the time the request should have gone out, send on that schedule whether or not earlier calls have finished, and cap the goroutines so the generator cannot exhaust its own memory.'
});
INTERVIEW('server-load-testing-and-capacity',{
  junior:[
    { q:`Why is a load test at 10 players useless for predicting 100,000?`,
      a:`Costs that are invisible at small scale appear at large scale: queues form when arrivals exceed service rate, connection pools and file descriptors run out, memory grows per room, garbage collection pauses stretch, and shared services such as the database have a limit that does not grow with the instance count. Say that latency does not rise gently; once a resource saturates, it climbs without bound.`,
      follow:`Name three resources that could be the first to saturate in a room-based game server.`,
      red:`Says the test only needs more machines, or that performance is linear in players.` },
    { q:`What is the difference between a ramp-and-hold, a soak, a spike and a breakpoint test?`,
      a:`A ramp climbs to the expected peak and holds it. A soak holds average load for hours to expose leaks and slow growth. A spike jumps to a multiple of peak for a few minutes to test survival and recovery. A breakpoint keeps raising load until the system fails, to find the capacity limit. k6 calls the first an average-load test (and a stress test if the hold is above peak) and also defines smoke, soak, spike and breakpoint tests.`,
      follow:`Which of those would find a memory leak of 2 MB per closed room, and why?`,
      red:`Describes only “run lots of users” with no shapes or purposes.` },
    { q:`Which numbers would you watch on a game server during a test?`,
      a:`Tick time at p99 and its maximum, because players feel the worst ticks. CPU per instance, memory per room, open connections and file descriptors, packet loss, database queries per second, error rate by type, and queue depth at login and matchmaking. Averages hide the spikes.`,
      follow:`Your mean tick time is 4 ms and players complain of hitches. What do you look at?`,
      red:`Names only average response time or CPU.` }
  ],
  mid:[
    { q:`Explain Little’s law and use it on a login service.`,
      a:`The average number of requests in the system equals arrival rate times average time in the system. At 50 logins per second and 2 seconds each, about 100 are in flight. If a database slowdown raises the time to 10 seconds, 500 are in flight, so a pool of 200 is full and the queue grows. The same law sizes pools, thread counts and queue limits, and shows why a slow dependency is also a capacity problem.`,
      follow:`Arrivals stay at 50 per second, each login holds a connection for 10 seconds and the pool is 200. How fast does the queue grow, and what should the service do?`,
      red:`Quotes the formula without applying it, or thinks it only applies to steady state with no queue.` },
    { q:`What is coordinated omission and how do you avoid it?`,
      a:`A closed-loop generator waits for each response before sending the next request, so when the server stalls the generator sends less and records only one slow sample instead of the many requests that would have been delayed. The percentiles come out far too good. Avoid it by sending on a fixed schedule (an open model, such as k6’s arrival-rate executors) and by measuring latency from the intended send time, or by correcting the histogram, as HdrHistogram supports.`,
      follow:`Your generator reports p99 of 40 ms but the server was stalled for 10 seconds. Is that p99 wrong, and by how much?`,
      red:`Believes a high VU count is enough to avoid it.` },
    { q:`After a server outage every client reconnects at once and the server falls over again. Why, and what do you change?`,
      a:`The reconnects are synchronised, so the first seconds carry far more load than normal and the login path saturates. Add randomised exponential backoff with a cap (full jitter), a retry budget so clients do not retry unboundedly, server-side admission control or a queue in front of the expensive step, and a retry-after hint. Test it by dropping every connection and counting reconnects per second.`,
      follow:`Is jitter alone enough if there are 1,000,000 clients and the login service handles 2,000 per second?`,
      red:`Retries immediately and indefinitely, or relies on scaling up the login tier.` }
  ],
  senior:[
    { q:`Build a capacity model for a 30 Hz room-based game from a test, and say how you would set the safety margin.`,
      a:`Tick budget is 33 ms. Measure CPU time per room tick at p99 under realistic play, choose a target utilisation (for example 60 to 70 per cent) to leave headroom for jitter and GC, then rooms per core = budget × utilisation ÷ cost per room, per instance = cores × rooms, instances = peak rooms ÷ rooms per instance, plus enough to lose a zone. Cost per CCU follows from price per instance hour. The margin depends on how fast capacity can start (GameLift says minutes for new instances), the spike factor you can defend and what an outage costs.`,
      follow:`The test machine was a laptop and production is a cloud instance. What do you re-measure?`,
      red:`Uses average tick time and 100 per cent utilisation, or gives a single number with no assumptions.` },
    { q:`A launch is in three weeks and the marketing estimate is 100,000 concurrent players. What is your plan?`,
      a:`Ask for the worst-case factor and plan the test for a multiple, because a published launch surged to 50 times its target. Set up open-model generators with protocol bots and mock tiers, run a doubling ladder with a fix-and-rerun loop, then breakpoint, spike and a multi-hour soak. Add overload behaviour (limits, queue, shedding, jittered retry) and test it at twice capacity. Rehearse failover and scale-up. Agree a buffer policy, a login queue and a runbook for the first night, and staff the first hours.`,
      follow:`You can only afford two of: the soak, the spike test, the chaos rehearsal. Which do you drop, and what is the risk?`,
      red:`Plans one big test in the last week, or only tests the expected number.` },
    { q:`Throughput is rising in your overload test but players report timeouts. What is happening?`,
      a:`Throughput counts requests handled, goodput counts those handled correctly and in time. Past capacity, work is accepted and then wasted: requests queue until the client has given up, the server finishes them anyway, and clients retry. Shed load early, bound queues (serve newest first or drop by age), propagate deadlines so dead requests are not worked on, and test beyond the break to confirm goodput stays flat as offered load rises.`,
      follow:`What would you chart to see it?`,
      red:`Treats the throughput curve as proof that the server is healthy.` },
    { q:`Design a chaos programme for a live game with autoscaling. What would you not do?`,
      a:`Start from a steady-state metric (match start success, tick p99), write a hypothesis, inject one realistic fault with a small blast radius and an abort condition, and automate once it is trusted. Begin in staging, move to production on a small slice at low-traffic hours. Do not inject faults you have no dashboard for, run them during an event, or stack two faults in the first experiment. Follow the principles at principlesofchaos.org.`,
      follow:`What is the abort condition for killing a zone’s game servers?`,
      red:`Randomly kills production machines with no hypothesis, metric or abort rule.` }
  ] });
FACTS('server-load-testing-and-capacity',[
  { claim:`Google’s SRE book describes client-side adaptive throttling with a multiplier K of 2 over a two-minute window of requests and accepts, a per-request retry limit of about three attempts, a per-client retry ratio below about 10 per cent, and four criticality levels (CRITICAL_PLUS, CRITICAL, SHEDDABLE_PLUS, SHEDDABLE).`, asOf:'2026-10-05', src:'https://sre.google/sre-book/handling-overload/' },
  { claim:`Google’s SRE chapter on cascading failures recommends testing components until they break, testing recovery as well as breakage, using randomised exponential backoff, bounded queues, and deadline propagation, and describes the garbage-collection death spiral and cold caches as failure modes.`, asOf:'2026-10-05', src:'https://sre.google/sre-book/addressing-cascading-failures/' },
  { claim:`k6 defines six test types (smoke, average-load, stress, soak, spike, breakpoint) and its test-types page is the source for those six.`, asOf:'2026-10-05', src:'https://grafana.com/docs/k6/latest/testing-guides/test-types/' },
  { claim:`k6 treats arrival-rate executors as the open model and constant-vus as the closed model; its documentation says a closed model couples the arrival rate to iteration time, which it names coordinated omission.`, asOf:'2026-10-05', src:'https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/' },
  { claim:`Locust creates one user per simulated user, each in its own gevent green thread; its wait_time options include constant_throughput (per-user pacing) and poisson, and wait time can only constrain throughput, not launch more users.`, asOf:'2026-10-05', src:'https://docs.locust.io/en/stable/writing-a-locustfile.html' },
  { claim:`Riot reported load testing VALORANT with a custom Go harness: about 10,000 simulated players per process on four CPUs, 200 containers for two million simulated players on a test shard, a three-hour run at full scale, a mock game server emulating over 500 games per core, and a doubling of player count between passing runs.`, asOf:'2026-10-05', src:'https://www.riotgames.com/en/news/scalability-and-load-testing-valorant' },
  { claim:`Heroic Labs’ Nakama was load tested to two million concurrent users with the Artillery tool on about 25,000 Fargate nodes, ramped over about 50 minutes, with scenarios running for four hours.`, asOf:'2026-10-05', src:'https://aws.amazon.com/blogs/gametech/how-code-wizards-load-tested-heroic-labs-nakama-to-two-million-concurrent-players-with-aws' },
  { claim:`Google Cloud reported that Pokémon GO’s launch traffic quickly surged to 50 times the initial target, about 10 times the worst-case estimate; within 15 minutes of the launch in Australia and New Zealand, traffic had already passed expectations.`, asOf:'2026-10-05', src:'https://cloud.google.com/blog/products/containers-kubernetes/bringing-pokemon-go-to-life-on-google-cloud' },
  { claim:`AWS says that in a five-layer stack with three retries per layer, the database load can rise 243 times during failures, recommends retrying at a single point in the stack, and describes token-bucket retry limiting.`, asOf:'2026-10-05', src:'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/' },
  { claim:`AWS defines throughput as total requests sent and goodput as the part handled without errors and with low enough latency to be used, and tests far beyond the point where goodput breaks.`, asOf:'2026-10-05', src:'https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/' },
  { claim:`AWS’s jitter experiment compared full, equal and decorrelated jitter; full jitter used less work than equal jitter; all three jittered variants cut the work substantially, and full jitter more than halved the calls compared with exponential backoff without jitter in a 100-client contention simulation.`, asOf:'2026-10-05', src:'https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/' },
  { claim:`Amazon GameLift’s target-based auto scaling keeps a PercentAvailableGameSessions buffer; its documentation says placing players in ready slots takes seconds while starting new instances and server processes can take minutes.`, asOf:'2026-10-05', src:'https://docs.aws.amazon.com/gameliftservers/latest/developerguide/fleets-autoscaling-target.html' },
  { claim:`Agones’ FleetAutoscaler policies include Buffer, Webhook, Counter and List (the reference lists seven types); the Buffer policy keeps bufferSize Ready game servers between minReplicas and maxReplicas, and the default sync interval is 30 seconds.`, asOf:'2026-10-05', src:'https://agones.dev/site/docs/reference/fleetautoscaler/' },
  { claim:`The Linux kernel documents a default ip_local_port_range of 32768 to 60999, and a net.core.somaxconn default of 4096 since Linux 5.4.`, asOf:'2026-10-05', src:'https://www.kernel.org/doc/html/latest/networking/ip-sysctl.html' },
  { claim:`getrlimit(2) documents that a process’s RLIMIT_NOFILE ceiling is bounded by /proc/sys/fs/nr_open; running out of descriptors fails with EMFILE.`, asOf:'2026-10-05', src:'https://man7.org/linux/man-pages/man2/getrlimit.2.html' },
  { claim:`The Go GC guide says GOGC defaults to 100, GOMEMLIMIT (Go 1.19) caps total runtime memory, and a limit set too low makes the program thrash in constant collection.`, asOf:'2026-10-05', src:'https://tip.golang.org/doc/gc-guide' },
  { claim:`Godot’s --headless flag sets the headless display and dummy audio drivers and is described as useful for servers; Godot’s default physics rate is 60 ticks per second.`, asOf:'2026-10-05', src:'https://docs.godotengine.org/en/stable/classes/class_projectsettings.html' },
  { claim:`Unity’s -batchmode runs with no display or input and -nographics skips graphics device initialisation.`, asOf:'2026-10-05', src:'https://docs.unity3d.com/6000.0/Documentation/Manual/PlayerCommandLineArguments.html' },
  { claim:`Gatling offers open-model injection steps (constantUsersPerSec, rampUsersPerSec, incrementUsersPerSec) and closed-model steps (constantConcurrentUsers, rampConcurrentUsers).`, asOf:'2026-10-05', src:'https://docs.gatling.io/concepts/injection/' }
]);
DIAGRAM('server-load-testing-and-capacity', { kind:'loop', title:'The capacity loop: push, find the first limit, fix, push again',
  steps:[{t:'Set the target',d:'Peak players, logins per second, and a multiple for the surprise.'},{t:'Generate load',d:'Open-model bots at a chosen arrival rate, doubling each round.'},{t:'Watch the knee',d:'Tick p99, memory per room, connections, database queries, errors.'},{t:'Name the first limit',d:'The resource that saturated first, not the loudest alarm.'},{t:'Fix or budget',d:'Change code and limits, or buy capacity at a known cost per player.'},{t:'Break it on purpose',d:'Overload, spike and kill a node; time the recovery.'}],
  note:'Each pass ends with a capacity number, the build it was measured on and the date.' });
EXPLAINER('server-load-testing-and-capacity', { kind:'explainer', title:'Past the knee, offered load keeps rising and useful work falls',
  frames:[
    { t:'A comfortable server: offered load and goodput rise together', d:'Goodput is the work that finishes in time to be useful. Illustrative shape.', spec:{ kind:'curve', x:'Time, while the test ramps up', y:'Requests per second', alt:'Two lines rise together from zero.', series:[{ t:'Offered load', pts:[[0,0.05],[0.3,0.3]] }, { t:'Goodput', pts:[[0,0.05],[0.3,0.3]] }] } },
    { t:'Approaching the knee: goodput bends slightly below the offered load', d:'Tick p99 is at 65% of its budget.', spec:{ kind:'curve', x:'Time, while the test ramps up', y:'Requests per second', alt:'Offered load keeps climbing; goodput starts to fall a little behind it.', series:[{ t:'Offered load', pts:[[0,0.05],[0.3,0.3],[0.5,0.5]] }, { t:'Goodput', pts:[[0,0.05],[0.3,0.3],[0.5,0.46]] }] } },
    { t:'The knee: the lines separate and a queue starts to grow', d:'Tick time reaches 100% of its budget.', spec:{ kind:'curve', x:'Time, while the test ramps up', y:'Requests per second', alt:'Goodput flattens while offered load keeps rising; the gap between them is the queue.', beats:[{ t:'the knee', at:0.5 }], series:[{ t:'Offered load', pts:[[0,0.05],[0.3,0.3],[0.5,0.5],[0.6,0.6]] }, { t:'Goodput', pts:[[0,0.05],[0.3,0.3],[0.5,0.46],[0.6,0.52]] }] } },
    { t:'Wasted work: queued requests time out, clients retry, and offered load jumps', d:'The server is busy the whole time, mostly on work nobody is waiting for any more.', spec:{ kind:'curve', x:'Time, while the test ramps up', y:'Requests per second', alt:'Offered load shoots up with the retries while goodput falls.', beats:[{ t:'the knee', at:0.5 }], series:[{ t:'Offered load', pts:[[0,0.05],[0.3,0.3],[0.5,0.5],[0.6,0.6],[0.75,0.9]] }, { t:'Goodput', pts:[[0,0.05],[0.3,0.3],[0.5,0.46],[0.6,0.52],[0.75,0.3]] }] } },
    { t:'A closed-loop load generator hides the collapse', d:'Each simulated client waits for its answer before sending the next, so it slows down with the server and reports a calm, flat line.', spec:{ kind:'curve', x:'Time, while the test ramps up', y:'Requests per second', alt:'What a closed-loop tool reports stays flat while real goodput collapses.', beats:[{ t:'the knee', at:0.5 }], series:[{ t:'Goodput', pts:[[0,0.05],[0.3,0.3],[0.5,0.46],[0.6,0.52],[0.75,0.3]] }, { t:'Closed-loop report', pts:[[0,0.05],[0.3,0.3],[0.5,0.46],[0.6,0.5],[0.75,0.5]] }] } },
    { t:'Shed load: refuse the excess early and goodput stays at capacity', spec:{ kind:'curve', x:'Time, while the test ramps up', y:'Requests per second', alt:'With a gate in front of the queue, goodput holds flat at capacity however high the offered load goes.', beats:[{ t:'the knee', at:0.5 }], series:[{ t:'Offered load', pts:[[0,0.05],[0.3,0.3],[0.5,0.5],[0.6,0.6],[0.75,0.9]] }, { t:'Goodput, shedding', pts:[[0,0.05],[0.3,0.3],[0.5,0.46],[0.6,0.52],[0.75,0.52]] }] } },
    { t:'Drop the load and time the recovery', d:'How long goodput takes to come back is a number to record, like capacity.', spec:{ kind:'curve', x:'Time after the load drops', y:'Requests per second', alt:'Offered load falls back below the knee; goodput climbs back after a delay, the recovery time.', beats:[{ t:'load drops', at:0.3 }, { t:'recovered', at:0.6 }], series:[{ t:'Offered load', pts:[[0,0.8],[0.3,0.8],[0.35,0.4],[1,0.4]] }, { t:'Goodput', pts:[[0,0.3],[0.35,0.3],[0.6,0.4],[1,0.4]] }] } },
    { t:'The capacity number sits left of the knee', d:'Set it where tick time is 60 to 70% of its budget, and write down the players per instance it implies.', spec:{ kind:'curve', x:'Players per instance', y:'Tick p99 (share of budget)', alt:'Tick time rises with players; capacity is marked where it reaches about 65% of the budget, well before 100%.', band:{ t:'headroom kept free', from:0.65, to:1 }, beats:[{ t:'capacity', at:0.55 }], series:[{ t:'Tick p99', pts:[[0,0.1],[0.3,0.3],[0.55,0.65],[0.75,0.9],[0.85,1]] }] } }
  ] });

T('server-framework-landscape',{ d:'server', t:'Multiplayer frameworks compared: how each one works', tag:'Frameworks differ by who owns the truth, what travels, and who pays per player. Read the mechanism, not the feature list.',
  what:`A map of the multiplayer libraries and services a team actually chooses between, read by mechanism. Every framework answers the same five questions. Who owns the state: a server, a host player, every client for its own objects, or nobody because all machines run the same deterministic code. What travels: state snapshots, remote calls, or only player input. How latency is hidden: nothing, interpolation, client prediction with rollback, or a full deterministic rollback. Where it runs: a dedicated process, a player’s machine, or a cloud room. What it costs and what limits it: a licence, a price per concurrent user, or the size of the box. The map covers Unity Netcode for GameObjects and Netcode for Entities, Photon Fusion and Quantum, Mirror and Fish-Net, Unreal replication and Iris, Godot’s high-level multiplayer, Nakama and Colyseus, Steamworks and Epic Online Services, the hosting layer (GameLift, Agones, edge providers), and the non-game real-time tools that teams borrow: Socket.IO, Phoenix Channels, Ably and Pusher style managed pub/sub, and Firebase Realtime Database. The process of choosing layers, keeping a seam and writing down the exit cost is the topic on choosing a stack. This topic is the landscape that process runs over.`,
  why:[`The authority model is a design decision wearing a library’s name. A framework where each client owns its own objects cannot stop a client from lying about them. A server-authoritative one can, and costs you prediction code and a server bill. You choose cheating exposure and feel when you choose the library.`,`The same word hides different machines. “Netcode” may mean state replication with prediction (Netcode for Entities, Fusion in server mode), input-only rollback over a deterministic simulation (Quantum), or a relay that forwards bytes and knows nothing about your game (a relayed Nakama match).`,`Scale ceilings sit in different places. Firebase Realtime Database publishes its limits (200,000 simultaneous connections per database, 1,000 writes a second as a guide). Photon sells concurrent users in tiers. Mirror and Fish-Net have no vendor cap and you carry the servers. Unreal’s ceiling is what one server process replicates, which Epic’s own Iris page frames around a 100-player battle royale.`,`Services end. One hosting provider in this landscape was reported, by a competing host’s blog and not by a vendor notice, to have been bought in March 2026 and to have ended game hosting on 5 May 2026, about nine weeks later. A framework you can read and run yourself is a different risk from a service you rent.`],
  think:{ q:[`Who is allowed to be wrong about the world: the server only, a host player, or each client about its own objects? What does a cheater gain under that answer?`,`Does the game need the same result on every machine (a fighting game, an RTS) or a close-enough result with fast reactions (a shooter)? That decides snapshots versus deterministic input.`,`How many players share one simulation, and how many sessions run at once? Those are two different ceilings, and frameworks price and limit them separately.`,`What does one concurrent player cost per month on this stack at ten times our hoped-for population, and what is the unit: instance hour, concurrent user, message, connection minute?`,`If the vendor changed price or shut down in a year, which layer could we replace in a month, and what is the seam?`,`Is this a game, or a real-time app (chat, presence, a live dashboard) that a game happens to need? A pub/sub service is the wrong tool for a 60 Hz action loop and the right one for a chat channel.`],
    trade:[`Server-authoritative state with prediction (Netcode for Entities, Fusion server mode, Unreal) protects the game and makes the client run the simulation twice. Netcode for Entities documents prediction as very CPU intensive because the client re-simulates several ticks for each snapshot, whether or not a correction was needed.`,`Deterministic rollback (Quantum) sends only input, so bandwidth stays small up to the documented 128 players. Every client still simulates the whole world, so client CPU grows with entities and players. It demands fixed-point or otherwise reproducible maths and a simulation with no hidden state. Photon’s Quantum FP type is Q48.16 for exactly that reason.`,`Client or shared authority (Fusion shared mode, NGO distributed authority) removes prediction and reconciliation code and removes the server’s ability to veto. Unity’s own documentation says distributed authority is not suitable for high-performance competitive games that require an accurate predictive motion model, and that depending on the platform and design it can be easier for bad actors to cheat.`,`Managed services remove operations and charge per unit forever. Self-hosted open source (Nakama, Colyseus, Agones, Mirror, Fish-Net) removes the unit price and gives you the pager.`],
    traps:[`Choosing by the engine’s default. Godot’s ENet-based high-level multiplayer, Unity’s Netcode and Unreal replication each suit a different default game. A default that matches the demo can still be the wrong model for a ranked mode.`,`Reading a free tier as a free game. Photon’s free 100 CCU plan, Ably’s 6,000,000 messages a month and 200 concurrent connections, and Firebase’s free-plan 100 simultaneous connections each end at a number you can reach in a week of a beta.`,`Mixing up the service and the netcode. Steamworks, Epic Online Services and Nakama give you identity, lobbies, relays and storage. None of them runs your gameplay simulation for you, except where you write the match handler yourself.`,`Putting a managed pub/sub service under an action game. Socket.IO’s default is at-most-once delivery with no resend on reconnect, and Phoenix Channels also drops a message for an offline client. Both are fine for chat and wrong as the only channel for an input stream.`,`Letting framework types leak into game rules. A health field that is a NetworkVariable or a Fusion networked property in forty classes can only be changed by touching all forty.`,`Benchmarking an empty scene. Mirror’s README lists a 2019 test at 480 CCU as its worst case and a later 2022 test at 400 to 800 CCU, and any CCU number you did not measure with your own entities and your own interest rules is marketing or history.`],
    good:[`You can say, for the chosen framework, who owns each piece of state, what travels each tick and what it costs per concurrent player at ten times launch load.`,`A thin interface sits between game rules and the vendor, and a soak test has run on the real topology with your own entities.`],
    bad:[`The stack was picked from a comparison table of feature names, with no test of the session size and tick rate the game needs.`,`The plan for a vendor shutdown is “we will migrate”.`] },
  how:[`Write the session model on one line before you open any documentation: players per session, sessions at peak, session length, and whether the world persists. Everything below depends on it.`,`Name the authority model in one of four words: server, host, shared, or deterministic. Reject any candidate that cannot be run in that mode, and mark any that can only be run in a mode that lets clients veto the server.`,`Make a three-column sheet for each shortlisted framework: how it hides latency (none, interpolation, prediction with rollback, input-only rollback), the unit it bills or limits (CCU, instance hour, message, connection), and the number at which that unit stops being free. Fill every cell from the official page and write the date beside it.`,`Build the smallest vertical slice, not a menu: two players, one moving object, one hit that matters, run at the tick rate and player count you plan to ship. Measure server CPU per session, bytes per second per player, and the correction rate on a link with 100 ms round trip and 2% loss.`,`Keep vendor types out of rule code and save files behind a small interface (Spawn, SetState, SendInput, OnSnapshot). The seam itself is taught in the stack-choices topic; here, check that the interface hides the framework-specific parts named above (ownership, prediction, interest management).`,`Match the family to the game before the vendor: a shooter or action game wants server state plus prediction or deterministic rollback; a fighting game or RTS wants deterministic input-only rollback; co-op, social and casual rooms can take shared authority; turn-based and party games fit a backend with match handlers or a relay; chat and presence belong on pub/sub. Where two families fit, take the one whose limit you can measure this week.`,`Decide the hosting layer separately. For short matches pick an orchestrator (Agones on Kubernetes, GameLift fleets, an edge provider) and price one concurrent match, not one instance. For a persistent world price the always-on cost of the world first.`,`If the game needs chat, presence or a live feed, give it a pub/sub service of its own, and write down the delivery guarantee (at-most-once, or resend from an offset) and what the client does after a reconnect.`,`Record the exit cost per vendor, as the stack-choices topic describes, and add the framework-specific line: which authority or prediction code would have to be rewritten, not just re-linked.`],
  ai:{ yes:[`Fill the three-column comparison sheet from official pages you paste in, and flag every cell where the page gave no number.`,`Draft the interface seam (Spawn, SetState, SendInput, OnSnapshot) in the engine’s language, and list the vendor types that must stay behind it.`,`Turn a described game (players per match, tick rate, state per entity) into a bandwidth and CPU estimate for each authority model, with the arithmetic shown.`,`Review a migration plan between two frameworks for the state and save-data types that would break.`],
       no:[`Pick the authority model for you. That is the cheating, feel and cost trade-off of your game.`,`Quote a price, tier or limit from memory. They change and the dated official page decides.`,`Say a framework will carry your concurrent players. Only a load test on your topology does that.`] },
  prompts:[{l:'Mechanism sheet',p:`Here are the official pages for [FRAMEWORK A] and [FRAMEWORK B], pasted below. For each, fill: authority model (server, host, shared, deterministic), what travels each tick, how latency is hidden, transports supported, the unit it bills or limits, and the number at which the free tier ends. Copy each number with its page and write NOT STATED where the page is silent. Do not fill a cell from memory.`},
    {l:'Per-player cost',p:`Our game: [PLAYERS PER MATCH] players, matches of [MINUTES] minutes, [PEAK CCU] concurrent players at peak. Using the pricing pages pasted below, compute monthly cost for [OPTION 1], [OPTION 2] and [OPTION 3] at the peak and at ten times the peak. Show every multiplication and name the single line item that dominates in each option.`},
    {l:'Exit plan',p:`We are about to depend on [VENDOR/FRAMEWORK] for [LAYER]. List every place our code would touch its types, propose the smallest interface that hides it, and estimate the rewrite if the vendor shut down in 90 days. State the weeks and the first player-visible feature that would break.`}],
  verify:[`Does each row of your comparison cite an official page and a date, and is every number on it a number the page states?`,`Is the authority model one you could defend to a cheater: does the server or deterministic simulation reject an impossible move, or does a client simply say it happened?`,`Was the vertical slice run at the real tick rate and player count, with latency and loss added, and were server CPU per session and bytes per player recorded?`,`Can the framework be swapped by changing one folder, or do its types appear in rule code, save files and the UI?`,`Does the pub/sub or realtime service you borrowed state its delivery guarantee, and does the client recover from a missed message?`],
  test:[`Run two to eight bots through the slice for 30 minutes at a 100 ms round trip with 2% loss. Record server CPU per session, bytes per second per player, and the count of corrections or rollbacks per minute.`,`Disconnect and reconnect a player mid-match, and measure how many seconds until the state is correct and whether anything they did is lost.`,`Double the player count in one session and then the session count. Note which one breaks first: server CPU, bandwidth, or a vendor limit.`,`Block UDP on a test network (or use a browser build) and see whether the framework falls back or fails.`] ,
  rel:[['server-stack-choices','That topic is the process of choosing hosting, services and netcode as three layers with a seam. This one is the landscape of mechanisms the process runs over.'],['server-authority','Each framework’s authority model, server, host, shared or deterministic, is that topic’s decision made concrete.'],['server-rollback-netcode','Quantum’s input-only rollback and Netcode for Entities’ prediction are the two ways that topic’s techniques ship.'],['platform-choice','The platform (WebGL, mobile, console) filters the frameworks before features do, for example because browsers have no UDP.'],['platforms-choosing-an-engine','The engine chosen first decides which netcode libraries even apply.'],['server-transport-and-relays','Which transports and relays a framework wraps, and what a relay can and cannot do, is the layer under this comparison.'],['server-bandwidth-and-interest-management','Interest management is the feature that separates frameworks at high player counts, and the topic that measures its payoff.'],['server-world-partitioning','Where a framework’s per-server ceiling is reached, partitioning is how the world continues past it.'],['server-load-testing-and-capacity','Every ceiling in a vendor’s page must be replaced by a number measured on your own slice.']],
  tech:[
    {n:'Server-authoritative state with prediction and reconciliation', how:`The server runs the simulation. Clients predict their own input locally and, on each snapshot, roll back to the server tick and replay the inputs since. Netcode for Entities does this by default at a 60 Hz simulation rate with a command slack of 2 ticks, and Fusion offers it in host and server modes.`, fit:`Shooters, action games and anything competitive that needs the server to veto.`, cost:`Client CPU grows with latency, because each snapshot means re-simulating several ticks. You write gameplay so it can be re-run, and you pay for a server per session.`, alt:`Shared or distributed authority, which has no prediction code and no veto.`},
    {n:'Deterministic input-only rollback', how:`Every machine runs the same simulation from the same input. Only input travels. Clients predict and, when a late input arrives, restore a saved frame and re-simulate. Quantum uses a fixed-point type (Q48.16) and an ECS with no hidden state to make this reproducible, and documents up to 128 players per game.`, fit:`Fighting games, sports, RTS and any game with many entities where snapshots would be too large.`, cost:`You give up floats, unordered iteration and library calls that vary by platform, and a desync is hard to find. Hidden information is awkward because every client holds the whole state.`, alt:`State replication with interest management, which sends more bytes and tolerates float maths.`},
    {n:'Shared or distributed authority', how:`Each client owns the objects it spawned and writes them directly. In Fusion’s shared mode each client has state authority over the objects it spawns, and the Photon room controls changes of state authority: it arbitrates and is not the authority. NGO’s distributed authority spreads ownership of distributable objects across clients, with one session owner for global state that moves to another client if it leaves.`, fit:`Co-op, casual and social rooms where cheating costs little.`, cost:`Physics between objects with different owners is hard. Unity’s documentation says there is typically no single physics simulation, and that the model is not suited to high-performance competitive games.`, alt:`A server-authoritative mode, with prediction code and a server.`},
    {n:'Authoritative match handler on a game backend', how:`You write the match logic (Go, TypeScript or Lua in Nakama, a Room class in Colyseus). The server calls it at a tick rate you set, passes in inputs and broadcasts state. Colyseus sends binary delta patches from a schema at 50 ms by default, Nakama lets you set the tick rate from 1 for turn-based to a high rate for action.`, fit:`Turn-based, real-time strategy, party and mid-pace games where you want accounts, matchmaking and storage with the match logic.`, cost:`You own the simulation code and the scaling. One Nakama node runs hundreds to thousands of matches depending on logic cost, so you must measure.`, alt:`An engine-integrated library, which gives prediction and object replication and ties you to that engine.`},
    {n:'Relay or room service with clients as authority', how:`The service passes bytes between clients, or keeps room state and presence, and does not check gameplay. Nakama’s relayed mode has no insight into the data. Steam’s sockets and Epic’s P2P relay through the platform’s servers.`, fit:`Co-op, turn-based, prototypes, and games where cheating is a social problem.`, cost:`Nothing stops a client lying, and a host leaving ends or migrates the session.`, alt:`A dedicated server, with a bill and a deployment pipeline.`},
    {n:'Managed pub/sub for non-game real-time features', how:`Chat, presence, live feeds and notifications use Ably, Pusher style services, Phoenix Channels, Socket.IO or Firebase Realtime Database. Ably bills per million messages, connection minutes and channel minutes. Firebase publishes 200,000 simultaneous connections and 1,000 writes a second per database.`, fit:`Anything where a message may arrive a second late and may be re-fetched.`, cost:`At-most-once delivery by default (Socket.IO, Phoenix), a bill that grows with fan-out, and no tick or snapshot model.`, alt:`A game server connection you already hold, which carries chat for free and ties chat to the server’s life.`}
  ] });
ENGINE('server-framework-landscape',{
  godot:{ term:`Godot’s high-level multiplayer defaults to server authority: the multiplayer authority of every node is the server unless you change it. A MultiplayerSpawner creates the same scene on every peer, and a MultiplayerSynchronizer copies the properties named in its replication config from the authority to the others. The default peer is ENet, with WebRTC and WebSocket as alternatives.`,
    api:['ENetMultiplayerPeer.create_server(port, max_clients)','MultiplayerAPI.multiplayer_peer','MultiplayerSpawner.spawn_function','MultiplayerSpawner.spawn(data)','MultiplayerAPI.peer_connected','Node.set_multiplayer_authority(id)'],
    snippet:`extends Node   # set the Spawner's spawn_path in the scene; clients set spawn_function too
@onready var spawner: MultiplayerSpawner = $Spawner
const PLAYER := preload("res://player.tscn")

func _ready() -> void:
\tspawner.spawn_function = _make_player
\tvar peer := ENetMultiplayerPeer.new()
\tpeer.create_server(7000, 16)
\tmultiplayer.multiplayer_peer = peer
\tmultiplayer.peer_connected.connect(func(id: int): spawner.spawn(id))

func _make_player(id: int) -> Node:
\tvar p := PLAYER.instantiate()
\tp.name = str(id)                     # same name on every peer
\treturn p                             # authority stays 1, the server`,
    pitfall:`Assuming Godot predicts for you. It does not: a MultiplayerSynchronizer copies state from the authority and has no prediction, rollback or lag compensation. A player node whose authority is the server feels laggy at 100 ms round trip until you build input buffering and reconciliation yourself, or give the client authority over its own movement and accept that it can lie. Also set spawn_function on every peer, and set the spawner's spawn_path in the scene, or spawn(data) cannot create the node on clients.`,
    map:`MultiplayerSpawner plus MultiplayerSynchronizer is the counterpart of Unity’s NetworkObject plus NetworkVariable, and of Unreal’s replicated actor with replicated properties. Prediction is not part of that trio in any of the three. Unity adds it in Netcode for Entities, Unreal in the character movement component. Unreal also has two replication scalers: the Replication Graph plugin (persistent nodes build per-connection lists, see FACTS) and Iris (Experimental, keeps a quantized copy of replicated state and separates replication from game-thread data). Epic's Iris page does not compare the two, so choosing between them is a measurement, not a documented ranking.` },
  unity:{ term:`Netcode for GameObjects works at the GameObject level. A NetworkObject marks what is networked, a NetworkVariable holds replicated state with a read and a write permission, and an Rpc attribute sends a call to a target. In client-server topology the server owns state. Distributed authority is the second topology and depends on the Multiplayer Services package. The Netcode for GameObjects manual describes no client prediction, which is what Netcode for Entities adds. Netcode for Entities is a separate package for ECS games, built on ghosts, snapshots and prediction.`,
    api:['NetworkBehaviour','NetworkVariable<T>','NetworkVariableWritePermission.Server','NetworkVariableReadPermission.Everyone','[Rpc(SendTo.Server)]','NetworkManager.SpawnManager.SpawnedObjects'],
    snippet:`using Unity.Netcode;
using UnityEngine;
public class Health : NetworkBehaviour {
    public NetworkVariable<int> Hp = new(100, NetworkVariableReadPermission.Everyone,
        NetworkVariableWritePermission.Server);   // the server writes, every client reads
    float _next;
    [Rpc(SendTo.Server)]   // a client says only "I fired at this target", never a damage number
    public void FireRpc(ulong targetId) {
        if (Time.time < _next) return;   // the server owns the cooldown; add aim and line of sight
        _next = Time.time + 0.5f;
        var t = NetworkManager.SpawnManager.SpawnedObjects[targetId].GetComponent<Health>();
        t.Hp.Value = Mathf.Max(0, t.Hp.Value - 10);   // the server picks the damage
    }
}`,
    pitfall:`Letting the owner write its own NetworkVariable because it is the shortest code. That is client authority, and it is what distributed authority gives you on purpose and a client-server game gives you by accident. Keep write permission on the server for anything the rules depend on, and let a client send intent (I fired), never a result (I did 50 damage), because any client can call a SendTo.Server Rpc on any object, as often as it likes. Also, an RPC method name must end in Rpc.`,
    map:`This is the same split as Godot’s authority and any_peer RPC modes: the server owns the value, and the client sends a request.` },
  note:`These snippets show only the ownership split, who may write a value and who may only ask. The framework differences that matter most (prediction, rollback, interest management, hosting) are not visible in a snippet, which is why the slice test in the verify list matters more than reading the API.` });
GO('server-framework-landscape', {
  api:['time.NewTicker','context.Context.Done','select with default','chan'],
  snippet:`package room

import (
	"context"
	"time"
)

const maxStep = 5 // largest move per input, in units

type Input struct{ Player, Dx, Dy int }

func clamp(v int) int { return max(-maxStep, min(maxStep, v)) }

type Snapshot struct {
	Tick uint64
	Pos  map[int][2]int
}

// Run is the shape an authoritative match handler has in Nakama or Colyseus:
// inputs arrive, one fixed step runs, a snapshot goes out. Inputs are applied
// on the server tick and each step is clamped, never on the client's say-so.
func Run(ctx context.Context, tickRate int, in <-chan Input, out chan<- Snapshot) {
	t := time.NewTicker(time.Second / time.Duration(tickRate))
	defer t.Stop()
	pos := map[int][2]int{}
	var tick uint64
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
		}
		for drained := false; !drained; {
			select {
			case i, ok := <-in:
				if !ok {
					return
				}
				p := pos[i.Player]
				p[0] += clamp(i.Dx)
				p[1] += clamp(i.Dy)
				pos[i.Player] = p
			default:
				drained = true
			}
		}
		tick++
		snap := Snapshot{Tick: tick, Pos: make(map[int][2]int, len(pos))}
		for k, v := range pos {
			snap.Pos[k] = v
		}
		select {
		case out <- snap:
		default: // a slow consumer loses a snapshot, not the room
		}
	}
}
`,
  pitfall:'Blocking the tick on a send to a slow client. Copy the state, offer it to a bounded channel with a default branch, and drop or disconnect the consumer that cannot keep up, or one phone on a bad network stalls the whole room.'
});
INTERVIEW('server-framework-landscape',{
  junior:[
    { q:`What is the difference between a server-authoritative game and one where each client owns its own objects, and what does each cost?`,
      a:`In a server-authoritative game the server runs the rules and clients send requests, so a client cannot make an impossible move count. The price is a server per session and prediction code, because the client otherwise waits a round trip to see its own move. With client or shared authority (Fusion shared mode, NGO distributed authority) each client writes its own objects, so there is no prediction or reconciliation code, and also no veto. Unity’s documentation says that depending on the platform and design it can be easier for bad actors to cheat, and that distributed authority is not suitable for high-performance competitive games that require an accurate predictive motion model.`,
      follow:`Name a game where you would pick client authority on purpose.`,
      red:`Says shared authority is just the faster option with no mention of cheating.` },
    { q:`Is Steamworks or Epic Online Services a netcode library?`,
      a:`No. They are platform services: identity, lobbies, matchmaking and a relayed connection. Steam’s networking sockets relay packets through Valve’s network by default so players and servers are not exposed, and Epic describes its services as free for any engine, store or platform. The simulation, state sync and prediction are still yours or a library’s.`,
      follow:`What would you still have to build on top of Steam’s sockets for a 16-player shooter?`,
      red:`Thinks adding Steam networking means the game is now synchronised.` },
    { q:`Why would you not use Socket.IO as the only channel for a real-time action game?`,
      a:`Its default delivery is at-most-once: if the connection drops, the message is not resent on reconnect. It starts on HTTP long-polling and upgrades, and its default transports are TCP based (it also lists WebTransport), so on TCP one lost packet holds back later ones. It fits chat, presence and dashboards, and is wrong for an input stream at 30 to 60 Hz that wants unreliable, unordered delivery.`,
      follow:`How would you add at-least-once delivery for a chat feature on top of it?`,
      red:`Believes a WebSocket library is a netcode library.` }
  ],
  mid:[
    { q:`Your team is choosing between Netcode for Entities and Photon Quantum for a competitive 4v4. What decides it?`,
      a:`Both predict and roll back, but they travel different things. Netcode for Entities is server-authoritative state replication: ghosts, snapshots, and a client that re-simulates from the last snapshot, which the documentation calls very CPU intensive. Quantum sends only input and every machine runs the same deterministic simulation in fixed-point maths, which is cheap on bandwidth and demands reproducible code, and hidden information is awkward because every client holds the whole state. Ask about the tick rate, entity count, whether hidden information matters (fog of war, stealth), whether the team already uses ECS, and the price: Quantum bills by concurrent user and Netcode for Entities is a free package plus your own hosting.`,
      follow:`A desync appears only on one platform. What do you check first in each stack?`,
      red:`Compares them by feature list without mentioning what travels or where the truth lives.` },
    { q:`How do you read a framework’s pricing page for a game with 20,000 concurrent players at launch?`,
      a:`Find the billing unit and the break point. Photon’s fixed monthly tiers stop at 2,000 CCU, and its premium cloud is billed at 0.50 dollars per CCU and adapts up to 50,000 CCU, so 20,000 CCU is roughly 10,000 dollars a month before traffic beyond the included allowance. Enterprise, the sales conversation, starts above 50,000. Ably bills messages, connection minutes and channel minutes, so a chat with high fan-out grows with messages not users. Firebase Realtime Database publishes 200,000 simultaneous connections and 1,000 writes a second per database. Compute a per-concurrent-player monthly cost at launch and at ten times, and name the line item that dominates.`,
      follow:`The free tier is generous. When does it stop being generous?`,
      red:`Compares monthly headline prices without the unit.` },
    { q:`A producer wants to host with a small startup’s game hosting service. How do you protect the project?`,
      a:`Put the orchestrator behind a seam. Your server is a container that speaks an allocation interface you control, so Agones on Kubernetes, GameLift fleets or an edge provider can all run the same image. Hathora is the recent cautionary case, as reported by a competing host’s blog (no vendor notice was found): an acquisition announced on 4 March 2026 and game hosting ended on 5 May 2026, about nine weeks. Record the exit time in weeks.`,
      follow:`What in your game server image would make it hard to move?`,
      red:`Says the vendor is well funded, so the risk is low.` }
  ],
  senior:[
    { q:`Design the stack for a 100-player persistent social space on mobile and web with a small budget. Which framework family and why?`,
      a:`Honest answer: do not run an action-grade simulation per player. Pick shared authority or interest-managed state sync with coarse movement, because each client owns its avatar and cheating costs little in a social space. Photon documents Fusion’s shared mode for mobile and WebGL. Interest management is what bounds bandwidth. Browsers have no UDP, so plan for WebSocket or WebRTC, and keep chat on its own pub/sub path with a stated delivery guarantee. Price one concurrent player at ten times launch. Prove it with a soak test of the whole room, because a vendor limit is not a measurement.`,
      follow:`Two players stand together and the room has 100 in it. What does each of them receive?`,
      red:`Proposes a single dedicated server with full snapshots to everyone.` },
    { q:`You can pick Mirror (free, MIT, you run the servers) or Photon Fusion (managed, per-CCU). Argue both sides for a team of five shipping a co-op game.`,
      a:`Mirror: no CCU cap, source access, server-authoritative with host mode, multiple transports, and you own hosting and scaling. Fusion: tick-based simulation with prediction, lag compensation and an area-of-interest system, plus Photon cloud for rooms and relay with a free 100 CCU launch plan. For co-op where cheating matters less, the managed room and relay removes operations. The decision rests on who carries the pager, the expected CCU, the exit cost, and whether the team needs prediction. Spike both for two days with the real player count.`,
      follow:`Fusion’s free plan ends at 100 CCU. What does your plan do the week the game trends?`,
      red:`Chooses on popularity or on the licence alone.` },
    { q:`A vendor’s documentation says it supports 128 players per session. How do you decide whether that number applies to you?`,
      a:`A supported size is a ceiling under the vendor’s own test conditions, not a promise for your entity count, tick rate or interest rules. Quantum documents up to 128 players per game, and Unreal’s Iris page frames its work around a 100-player battle royale. Run your own slice with your entities at the target tick rate, record server CPU per session and bytes per player, then add loss and latency. If it does not hold, the fixes are lower tick rate, interest management, or partitioning, in that order.`,
      follow:`CPU is fine but bandwidth is 3 times your budget. What do you cut first?`,
      red:`Treats the documented number as the capacity plan.` }
  ] });
FACTS('server-framework-landscape',[
  { claim:`Netcode for Entities (1.8 documentation; the package registry on 2026-10-03 lists 1.14.3 as the newest for Unity 2022.3 and 7.1.0 for Unity 6000.7) is described as a server-authoritative framework with client prediction. It sits on Unity’s Entity Component System, supports Unity 2022.3 LTS and Unity 6 LTS, and its prediction default is a 60 Hz simulation tick rate and a command slack of 2 ticks. The prediction page calls prediction very CPU intensive because clients re-simulate multiple ticks per snapshot.`, asOf:'2026-10-05', src:'https://docs.unity3d.com/Packages/com.unity.netcode@1.8/manual/intro-to-prediction.html' },
  { claim:`Netcode for GameObjects (2.3.2 documentation) supports two topologies, client-server and distributed authority. Distributed authority spreads ownership of distributable NetworkObjects across clients, uses a session owner that is re-selected if that client leaves, depends on the Multiplayer Services package, and Unity says it is not suitable for high-performance competitive games.`, asOf:'2026-10-05', src:'https://mp-docs.dl.it.unity3d.com/netcode/2.3.2/terms-concepts/distributed-authority/' },
  { claim:`Unity package registry, read 2026-10-03: every Netcode for GameObjects 2.x release requires Unity 6 (the 2.0.0 manifest requires 6000.0), so 1.x is the line for 2021.3 and 2022.3. The newest releases were 2.13.3 (6000.0) and 3.1.0 (6000.7). The NGO 2.4 manual says it supports Unity 6.0 and later and describes no client prediction or rollback.`, asOf:'2026-10-05', src:'https://packages.unity.com/com.unity.netcode.gameobjects' },
  { claim:`Photon’s public pricing page lists a free 20 CCU development plan, a free 100 CCU launch plan for one app (about 40,000 MAU, 0.3 TB traffic a month), paid monthly plans of 500 CCU at 125 dollars, 1,000 CCU at 250 dollars and 2,000 CCU at 500 dollars, and a premium cloud at 0.50 dollars per CCU with a 1,000 dollar monthly minimum, adapting to usage up to 50,000 CCU. Enterprise terms sit above that.`, asOf:'2026-10-05', src:'https://www.photonengine.com/fusion/pricing' },
  { claim:`Photon announced on 11 March 2024 that Fusion and Quantum have a free 100 CCU plan, up from 20, for one application per studio, and that it cannot be combined with paid CCU plans.`, asOf:'2026-10-05', src:'https://blog.photonengine.com/?p=5466' },
  { claim:`Photon’s Fusion 2 documentation lists three topologies, dedicated server, client-host and shared authority, with client-side prediction and lag compensation in the server-authoritative modes and an area-of-interest system. In shared authority each client has state authority over the objects it spawns, and the Photon room controls changes of state authority. Photon Quantum 3 is documented as a deterministic ECS for up to 128 players, using predict/rollback on input only.`, asOf:'2026-10-05', src:'https://doc-us-test.photonengine.com/quantum/current/quantum-intro' },
  { claim:`Mirror is MIT licensed, supports Unity 2019 to 2022 LTS and 6000.1, and lists server and client authority, interest management, snapshot interpolation and multiple transports (UDP, TCP, WebSockets, Steam, relay). Its README cites a 2019 test with 480 CCU as worst case and a 2022 test at 400 to 800 CCU.`, asOf:'2026-10-05', src:'https://github.com/MirrorNetworking/Mirror' },
  { claim:`Fish-Networking is free, server-authoritative by design, and its documentation says it has no CCU caps or paywalls and allows any server host. Its documentation describes a Transport system for any topology and a prediction feature, defined as server-authoritative actions while clients move in real time without delay.`, asOf:'2026-10-05', src:'https://fish-networking.gitbook.io/docs' },
  { claim:`Unreal Replication Graph: standard replication makes each replicated actor decide whether to update each connected client, a CPU bottleneck at scale; the plugin uses persistent nodes to build replication lists, and Epic cites Fortnite Battle Royale with 100 players and about 50,000 replicated actors.`, asOf:'2026-10-05', src:'https://dev.epicgames.com/documentation/en-us/unreal-engine/replication-graph-in-unreal-engine' },
  { claim:`Godot Engine is released under the MIT licence.`, asOf:'2026-10-05', src:'https://godotengine.org/license/' },
  { claim:`Unreal Engine’s documentation describes a server-authoritative client-server model with three replication systems: the default generic system, Replication Graph and Iris. Iris is marked Experimental, is opt-in, and is described as built on experience from a game with up to 100 players per server.`, asOf:'2026-10-05', src:'https://dev.epicgames.com/documentation/en-us/unreal-engine/introduction-to-iris-in-unreal-engine' },
  { claim:`Godot’s high-level multiplayer provides ENet (default), WebRTC and WebSocket peers. The default authority is the server, RPC modes are authority and any_peer, and transfer modes are unreliable, unreliable_ordered and reliable. MultiplayerSynchronizer replication_interval and delta_interval default to 0.0, meaning every network frame.`, asOf:'2026-10-05', src:'https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html' },
  { claim:`Nakama is Apache-2.0 licensed, names CockroachDB as its database in its README (other database support was not checked), and its runtime code can be written in Lua, TypeScript/JavaScript or Go. It offers relayed multiplayer, where the server does not inspect the data, and authoritative multiplayer. Heroic Cloud is the managed offering.`, asOf:'2026-10-05', src:'https://heroiclabs.com/docs/nakama/concepts/multiplayer/' },
  { claim:`Colyseus is an MIT-licensed Node.js framework with authoritative rooms. State is defined with schema decorators and sent as binary delta patches, by default every 50 ms (20 per second). It has official SDKs for web, Unity, Godot, Defold, GameMaker, Construct and Haxe, and a managed Colyseus Cloud.`, asOf:'2026-10-05', src:'https://docs.colyseus.io/' },
  { claim:`Steam’s networking sockets relay packets through Valve’s network by default so that players and servers are protected, support messages larger than one packet and reliable delivery, and may use a direct connection when appropriate. The documentation page states no developer cost.`, asOf:'2026-10-05', src:'https://partner.steamgames.com/doc/features/multiplayer/networking' },
  { claim:`Epic Online Services was announced in a 2021 post as free for any engine, store or platform, with services including matchmaking, lobbies, leaderboards, voice (relayed through Epic’s servers) and anti-cheat.`, asOf:'2026-10-05', src:'https://onlineservices.epicgames.com/news/epic-online-services-launches-two-new-free-services' },
  { claim:`Amazon GameLift Servers has managed EC2 fleets, managed container fleets and Anywhere fleets (your own computes registered with the service). All fleets support FlexMatch matchmaking through a placement queue. Its pricing page bills per instance hour (an example c6a.4xlarge at 0.741 dollars an hour), lists Spot savings of 50% to 85%, and says network bandwidth is free for instance generation 6 and later.`, asOf:'2026-10-05', src:'https://aws.amazon.com/gamelift/servers/pricing/' },
  { claim:`Agones is an Apache-2.0 open-source platform on Kubernetes that adds GameServer, Fleet, FleetAutoscaler and GameServerAllocation resources. It ships no matchmaker; its documentation has integration patterns showing how an external matchmaker allocates a server through GameServerAllocation.`, asOf:'2026-10-05', src:'https://agones.dev/site/docs/overview/' },
  { claim:`Edgegap’s pricing page lists on-demand edge hosting at 0.00115 dollars per vCPU per minute while active, egress at 0.10 dollars per GB, reserved bare metal from 0.0256 dollars per vCPU per hour, and relays from 8 dollars a month for 100 CCU to 450 dollars for 2,000 CCU. It says relays carry no compute and are not authoritative servers.`, asOf:'2026-10-05', src:'https://edgegap.com/pricing' },
  { claim:`Reported, not confirmed by a vendor page: Hathora was acquired by Fireworks AI (announced 4 March 2026), Hathora Cloud game hosting ended on 5 May 2026, and customers were pointed to Nitrado. The readable source is a competing host’s blog; the vendor domain redirects to Nitrado’s product. Recheck before citing it as a date.`, asOf:'2026-10-05', src:'https://crux.supercraft.host/blog/hathora-shut-down-where-to-go-after-may-2026/' },
  { claim:`Socket.IO starts on HTTP long-polling and upgrades to WebSocket (its how-it-works page also lists WebTransport as a built-in transport), with a default ping interval of 25 seconds and pong timeout of 20 seconds. Its default delivery is at-most-once, with no resend after a dropped connection; at-least-once needs the retries option or application-level event ids and offsets.`, asOf:'2026-10-05', src:'https://socket.io/docs/v4/delivery-guarantees/' },
  { claim:`Phoenix Channels use WebSocket or long polling, route by topic, spread across nodes through PubSub, and deliver at most once: a client that is offline misses the message.`, asOf:'2026-10-05', src:'https://phoenix.hexdocs.pm/channels.html' },
  { claim:`Ably’s pricing page lists a free tier of 6,000,000 messages a month, 200 concurrent connections and 200 concurrent channels, and pay-as-you-go prices of 2.50 dollars per million messages, 1.00 dollar per million connection minutes and 1.00 dollar per million channel minutes before volume discounts, with Standard at 29 dollars a month and Pro at 399 dollars a month.`, asOf:'2026-10-05', src:'https://ably.com/docs/platform/pricing' },
  { claim:`Firebase Realtime Database allows 200,000 simultaneous connections per database on standard plans (100 on the free Spark plan) and about 1,000 writes a second per database, above which writes may be rate limited. Firebase recommends sharding across databases beyond that.`, asOf:'2026-10-05', src:'https://firebase.google.com/docs/database/usage/limits' }
]);
DIAGRAM('server-framework-landscape', { kind:'matrix', title:'Seven families: who owns the truth, and what hides latency',
  note:'Limits, costs and when each family pays off are in the worked table below.',
  rows:['Server state plus prediction','Server, no prediction','Input-only rollback','Shared authority','Backend match handlers','Platform services','Pub/sub and rooms'],
  cols:['Examples','Who decides, what hides latency'],
  cells:[['Netcode for Entities, Fusion server mode, Unreal, Fish-Net','Server decides; client predicts'],
    ['Godot high-level multiplayer, NGO, Mirror','Server decides; you write prediction'],
    ['Photon Quantum','Same simulation everywhere; only input travels'],
    ['Fusion shared mode, NGO distributed authority','Each client owns what it spawns; no veto'],
    ['Nakama, Colyseus','Your handler, on the server, at your tick'],
    ['Steamworks, Epic Online Services, GameLift, Agones, Edgegap','Identity, lobbies, relays, hosting; no match logic'],
    ['Socket.IO, Phoenix, Ably, Firebase','At-most-once delivery; no tick']] });

WORKED('server-framework-landscape', {
  kind:'table',
  id:'framework-families',
  t:'Seven framework families, with limits and costs',
  intro:'The seven families of multiplayer framework, by who owns the state, how latency is hidden, what limits or bills them, and when each pays off. Read a row as the starting point for the three-column sheet in How: fill it from each vendor\'s official page and date every cell.',
  note:'Terms and prices as this topic\'s sources stated them when checked; terms marked as not checked were not read. Check each vendor\'s current page before relying on a number.',
  columns:[{h:'Family'},{h:'Examples'},{h:'Authority and latency'},{h:'Limit and cost'},{h:'Pays off when'}],
  rows:[
    ['Server state plus prediction', 'Netcode for Entities, Fusion server mode, Unreal replication, Fish-Net', 'Server decides; client predicts', 'Netcode for Entities is a Unity package (check Unity current terms); Fusion per CCU; Fish-Net no CCU cap; Unreal licence terms not checked here, see Epic; you pay for servers', 'The server must veto and the feel must be instant'],
    ['Server state, no built-in prediction', 'Godot high-level multiplayer, NGO client-server, Mirror', 'Server decides; no prediction in Godot or NGO docs, so you write it. Mirror host mode is a listen server, so the host can cheat; Mirror prediction not checked here', 'Godot MIT; Mirror MIT, no vendor CCU cap; NGO a package, 2.x needs Unity 6; you pay for servers', 'Slower-paced play, or a team ready to build prediction'],
    ['Deterministic input-only rollback', 'Photon Quantum', 'Every machine runs the same fixed-point simulation; only input travels', 'Documented 128 players; priced per CCU', 'Many entities, tiny bandwidth, same result everywhere'],
    ['Shared or client authority', 'Fusion shared mode, NGO distributed authority', 'Each client owns what it spawns; no veto', 'Needs the Photon cloud or Unity Multiplayer Services', 'Cheating costs little and players are many'],
    ['Game backend with match handlers', 'Nakama, Colyseus', 'Your match handler runs on the server at your tick rate', 'Nakama: one node runs hundreds to thousands of matches; Colyseus patches every 50 ms by default', 'Turn-based or mid-pace play with accounts and matchmaking'],
    ['Platform services and hosting', 'Steamworks, Epic Online Services, GameLift, Agones, Edgegap', 'Identity, lobbies, relays and orchestration; no match logic', 'Steam and EOS stated free; GameLift per instance hour; Agones open source; Edgegap per vCPU minute', 'You need people, relays or servers placed, not a simulation'],
    ['Managed pub/sub and room services', 'Socket.IO, Phoenix, Ably, Firebase', 'At-most-once by default; no tick or snapshot', 'Ably per message and minute; Firebase 200,000 connections per database', 'Chat, presence and feeds, not a 60 Hz loop']
  ],
  try:['Pick the family your current game uses. Which cell in its row would you check first on the vendor\'s page, and why that one?', 'Your game is a four-player co-op brawler that may later add a ranked mode. Which two rows fit now, and what would the ranked mode change?', 'Two families fit your game. Which limit in the cost column could you measure this week with a two-player slice?'],
  file:'framework-families.csv'
});
