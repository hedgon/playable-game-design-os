# Fact-check: server-transport-and-relays

Checked 2026-10-05 against the draft `server-transport-and-relays.js`, its `.sources.md`, the brief section in `briefs/topics.md` and `briefs/topic-common.md`.

## Verdict: PASS WITH FIXES

- WRONG: 1. The FACTS line for RFC 8445 maps the type preferences to the wrong candidate types.
- UNSUPPORTED: 0.
- OUTDATED: 0.
- Unlabelled arithmetic or practice that needs a label or a fix: 3. These are the relay-cost example, the 15-30 s keepalive and the frame 5 timing in the explainer.
- Most serious issue: the Go relay uses one key for both roles. Either player can forge the other player's role and redirect that player's traffic to their own address. The pitfall text says this sketch prevents that attack, so the teaching is wrong as well as the code.

Validation: `PLAYABLE_DRAFTS=docs/program-2026-10/drafts/server-transport-and-relays.js,docs/program-2026-10/drafts/server-bandwidth-and-interest-management.js node src/validate.js` printed `OK: all cross-links resolve, all topics complete.` The other lines it printed were guide warnings about existing games and paths, not about this draft.

How the RFCs were checked: the plain-text RFCs were downloaded from rfc-editor.org and searched for the exact wording. I did not rely on summaries for them.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
|---|---|---|---|---|
| "125 ms ping ... a fifth of a second ... half a second or more" | why[0], junior Q1 | CONFIRMED | Fiedler: "roughly 1/5th of a second ... at best", "up to half a second or more" | https://gafferongames.com/post/udp_vs_tcp/ |
| "200 ms is 12 snapshots" at 60 Hz | why[0] | CONFIRMED (arithmetic) | 0.2 x 60 = 12. The sum is shown inline. | writer's arithmetic |
| Fiedler: do not mix TCP and UDP | traps[0] | CONFIRMED | "Don't mix TCP and UDP!" | gafferongames udp_vs_tcp |
| IPv4+UDP 28 bytes, IPv6+UDP 48 | why[1], junior Q2 | CONFIRMED | 20+8 and 40+8 (minimum headers) | RFC 8200, RFC 768 |
| IPv6 guarantees 1,280; routers do not fragment | why[1], FACTS | CONFIRMED | RFC 8200: every link must have an MTU of at least 1280 octets, and only source nodes fragment | https://www.rfc-editor.org/rfc/rfc8200 |
| "QUIC assumes 1,200"; "ceiling for the whole datagram" | why[1], how[4] | CONFIRMED with a wording fix | RFC 9000 s14: QUIC's 1,200 is the **UDP payload** ("datagram size ... not the UDP or IP headers"). 1,280 - 48 = 1,232. In how[4], "whole datagram" reads as if headers were included. Say "1,200 bytes of UDP payload". | RFC 9000 s14 |
| Initial datagram >= 1,200, 3x amplification limit, migration with connection ids and PATH_CHALLENGE | FACTS, how[6], senior Q3 | CONFIRMED | RFC 9000 s8.1 and s9; s14.1 says "MUST expand ... to at least ... 1200 bytes" | https://www.rfc-editor.org/rfc/rfc9000 |
| RFC 9221: DATAGRAM frames not retransmitted, congestion controlled, max_datagram_frame_size default 0 | FACTS, TECH QUIC | CONFIRMED | RFC 9221 s3 ("default for this parameter is 0"), s5.4 | https://www.rfc-editor.org/rfc/rfc9221 |
| RFC 8445: "host, server-reflexive, peer-reflexive and relayed ... 126, 110, 100 and 0 in that order" | FACTS[4] | **WRONG** | RFC 8445 s5.1.2.2: 126 host, **110 peer-reflexive, 100 server-reflexive**, 0 relayed. Fix: list the types as "host, peer-reflexive, server-reflexive and relayed". how[8] and mid Q2 already give the right order. | https://www.rfc-editor.org/rfc/rfc8445 |
| ICE tests pairs with STUN binding checks | FACTS, mid Q2 | CONFIRMED | RFC 8445 s7 | RFC 8445 |
| TURN allocation 10 min default; permissions 5 min; UDP/TCP/TLS/DTLS to server | FACTS, how[9], TECH relay | CONFIRMED | RFC 8656 s3 ("10 minutes"), s9 ("MUST be 300 seconds"), s3.1 transport table | https://www.rfc-editor.org/rfc/rfc8656 |
| NAT UDP mapping at least 2 min, 5 recommended, outbound refresh | FACTS, traps[4], how[9] | CONFIRMED | RFC 4787 REQ-5 and REQ-5c, REQ-6 | https://www.rfc-editor.org/rfc/rfc4787 |
| Keepalive "every 15 to 30 seconds" | how[9] | CONFIRMED as practice; needs a label | Only the sources file labels it as a rule of thumb. The draft states it as a rule. A primary anchor exists: RFC 8445 s11 says agents SHOULD use a keepalive interval (Tr) of 15 s and MUST NOT go below 15 s. RFC 8656 also notes that many NATs expire bindings well before 5 min. Cite RFC 8445 s11 and keep "15 to 30" as practice. | RFC 8445 s11, RFC 8656 s9 note |
| WebRTC: SCTP/DTLS/UDP; ordered or not; partial reliability; one association shares one congestion window | FACTS, TECH WebRTC | CONFIRMED | RFC 8831 s6.1 ("all SCTP streams within a single SCTP association share the same congestion window") | https://www.rfc-editor.org/rfc/rfc8831 |
| "Keep messages near 16 KB or less" | TECH WebRTC | CONFIRMED | RFC 8831 s6.6: SHOULD limit to 16 KB without message interleaving | RFC 8831 |
| MDN: WebTransport Baseline 2026, newly available since March 2026 | FACTS, why[4] | CONFIRMED | web-features 3.40.1 (the data behind MDN's Baseline banner) gives baseline "low", baseline_low_date **2026-03-24**: Chrome/Edge 97, Firefox 114, Safari and iOS 26.4. Datagrams and bidirectional streams are Baseline. `createUnidirectionalStream` is **not** Baseline, because Firefox lacks it. The draft does not rely on unidirectional streams. | https://cdn.jsdelivr.net/npm/web-features/data.json (feature `webtransport`) |
| WebSocket has no backpressure; bufferedAmount | TECH WebSocket | CONFIRMED | MDN: the WebSocket interface "doesn't support backpressure" | https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API |
| Tailscale: direct "over 90 per cent of the time" | why[2] | CONFIRMED, with a wording fix | The quote is accurate and attributed. "the other tenth needs a relay" overstates it. Say "up to a tenth, in Tailscale's setting". | https://tailscale.com/blog/how-nat-traversal-works |
| easy+hard NAT needs port spraying; two hard NATs fall back to a relay | traps[3] | CONFIRMED (inference) | Tailscale explains birthday-paradox probing and says that two hard NATs make probing impractical | Tailscale |
| GNS: reliable and unreliable, AES-GCM-256 per packet, fragmentation above MTU, ICE | how[1] | CONFIRMED | README feature list | https://github.com/ValveSoftware/GameNetworkingSockets |
| GNS README: SDR not offered on other platforms to all partners | FACTS | CONFIRMED | README: "not able to offer access to SDR on other platforms to all partners" | GNS README |
| Send flags Reliable, Unreliable, NoNagle, NoDelay; batching for a configurable time | TECH library | CONFIRMED | Nagle is on by default and buffers "up to the Nagle time". "A few milliseconds" is not given on the page. The config enum exists (`k_ESteamNetworkingConfig_NagleTime`), but I did not find the default value. | https://partner.steamgames.com/doc/api/ISteamNetworkingSockets |
| SDR hides IPs, protects from DoS, P2P relayed over Valve backbone "when appropriate" | FACTS, TECH relay | CONFIRMED | Steamworks networking page | https://partner.steamgames.com/doc/features/multiplayer/networking |
| Fiedler: 33 acks per packet, 32-bit ack field, resend no more than every 0.1 s, ride along until acked | how[2], TECH custom, mid Q1 | CONFIRMED | "33 acks per-packet"; "hasn't been sent in the last 0.1 seconds" | gafferongames reliability_ordering...; reliable_ordered_messages |
| 33 acks at 60 pps is about half a second | how[2] | CONFIRMED (arithmetic) | 33/60 = 0.55 s. The sources file says 32/60. Both are about half a second. | writer's arithmetic |
| 16-bit sequence wraps in about 18 min at 60 pps | how[3] | CONFIRMED (arithmetic) | 65,536 / 60 = 1,092 s. Fiedler gives half an hour at 30 pps, which agrees. | Fiedler + arithmetic |
| netcode standard request padded to 1,078 bytes | how[6] | CONFIRMED | STANDARD.md: 1078 bytes; replies must be smaller than the request | https://github.com/mas-bandwidth/netcode/blob/main/STANDARD.md |
| Unity Transport reliable window default 32 (max 64) | how[5], FACTS | CONFIRMED | "The default limit is 32, and the maximum is 64." | https://docs.unity3d.com/Packages/com.unity.transport@2.4/manual/pipelines-usage.html |
| 32 packets per 300 ms RTT is about 106 packets/s | how[5] | CONFIRMED (arithmetic) | 32/0.3 = 106.7 | writer's arithmetic |
| Unity Transport fragmentation assumes MTU about 1,400 | FACTS | CONFIRMED | "approximately 1400 bytes" | same page |
| Simulator: 20-200 ms delay, jitter about half, loss rarely above 3% | how[13] | CONFIRMED | Matches the page wording | same page |
| Unity Relay: 150 players per session; WebGL has no UDP, so no DTLS | FACTS, TECH relay, Unity pitfall | CONFIRMED | relay-limitations page | https://docs.unity.com/en-us/mps-sdk/relay-limitations |
| Relay connection types udp, dtls, wss; WebGL uses wss + UseWebSockets (UTP 2.0+); standalone Relay package deprecated in Unity 6 | FACTS, ENGINE unity, how[10] | CONFIRMED | relay-and-ngo tutorial | https://docs.unity.com/en-us/mps-sdk/tutorials/relay-and-ngo.md |
| NGO `SendNamedMessage(..., NetworkDelivery)` with default ReliableSequenced | ENGINE unity snippet + pitfall | CONFIRMED | `SendNamedMessage(string messageName, ulong clientId, FastBufferWriter messageStream, NetworkDelivery networkDelivery = NetworkDelivery.ReliableSequenced)`. The overload with `IReadOnlyList<ulong>` exists too. | https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.4/api/Unity.Netcode.CustomMessagingManager.html |
| `NetworkDelivery.UnreliableSequenced` | ENGINE unity | CONFIRMED | Enum members: Reliable, ReliableFragmentedSequenced, ReliableSequenced, Unreliable, UnreliableSequenced ("Unreliable with sequencing") | .../api/Unity.Netcode.NetworkDelivery.html |
| `FastBufferWriter(32, Allocator.Temp)`, `WriteValueSafe(uint)`, `WriteValueSafe(Vector3)`, `using var` | ENGINE unity snippet | CONFIRMED | `FastBufferWriter(int size, Allocator allocator, int maxSize = -1)`; `WriteValueSafe(in Vector3)`; generic `WriteValueSafe<T>(in T, ForPrimitives)`; the struct is IDisposable | .../api/Unity.Netcode.FastBufferWriter.html |
| Godot `initialize({"iceServers": ...})`, `create_data_channel(label, options)` with negotiated/id/ordered/maxRetransmits; default reliable and ordered | ENGINE godot snippet + pitfall | CONFIRMED | The class reference lists exactly these keys. Channels are reliable and ordered by default. | https://docs.godotengine.org/en/stable/classes/class_webrtcpeerconnection.html |
| `WebRTCDataChannel.put_packet()` | ENGINE godot | CONFIRMED | WebRTCDataChannel inherits PacketPeer, which provides put_packet | Godot class reference |
| Native Godot builds need an extension for WebRTC | (not in draft) | Missing | Godot WebRTC tutorial: these classes "require an external GDExtension plugin on native (non-HTML5) platforms" (webrtc-native). The draft's `term` and snippet imply WebRTC works out of the box. | https://docs.godotengine.org/en/stable/tutorials/networking/webrtc.html |
| GameLift player gateway: opt-in relay, hides IPs, token on all traffic, per-player rate limit; Enhanced DDoS on by default for SDK 5, does not hide IPs | FACTS, TECH gateway, how[12], senior Q1 | CONFIRMED | AWS comparison table | https://docs.aws.amazon.com/gameliftservers/latest/developerguide/ddos-protection-intro.html |
| Relay cost: host + 8 clients, 64/32 kbit/s, 768 kbit/s each way, about 345 MB/h per match, 10,000 matches = 7.7 Gbit/s | senior Q2 | CONFIRMED (arithmetic); needs a label and a fix | 8x64 = 512 and 8x32 = 256 kbit/s give 768 kbit/s in and out. That is 96 kB/s and 345.6 MB/h; 10,000 x 768 kbit/s = 7.68 Gbit/s. Three problems: (1) the draft does not say the bitrates are invented (only the sources file does); (2) the question sets a 12 per cent relay share and the answer never applies it. "Ten thousand such matches" must mean ten thousand **fully relayed** matches, so say so, or show how 12 per cent of players turns into a share of relayed matches (with a host relay such as Unity Relay, a whole match is relayed); (3) "relay egress is the host's downstream plus the clients'" is correct only when every player in the match is relayed. | writer's arithmetic |
| Explainer frame 5: "After about one round trip (200 ms or more at a 125 ms ping)" | EXPLAINER | WRONG wording (internal) | 200 ms is not one round trip at a 125 ms ping. Fiedler's figure is the RTT plus a one-way trip at best. Say "after more than a round trip (about 200 ms at a 125 ms ping)". | gafferongames udp_vs_tcp |

## Code issues

**Go relay (GO block): read line by line against Go 1.23. Not compiled, because Go is not installed.**

Compilation, as far as reading can tell:
- Every import is used: `crypto/hmac` (`hmac.New`, `hmac.Equal`), `crypto/sha256` (`sha256.New`), `encoding/binary`, `net`, `sync`.
- `hdr` is an untyped constant equal to 33. `make([]byte, 1200+hdr)` is valid.
- `conn.ReadFrom(buf)` returns `(int, net.Addr, error)`.
- `role` is a `byte`. Indexing an array with a `byte` is legal, and so is `1-role` (byte arithmetic, which gives 1 or 0 because `buf[8] > 1` was rejected earlier).
- Ignoring the results of `mac.Write` and `conn.WriteTo` is legal.
- `mac.Sum(nil)[:16]` is compared with `buf[17:hdr]`, which is 16 bytes. The lengths match.
- I expect it to compile. The API list is real: `net.PacketConn`, `binary.BigEndian.Uint64`, `hmac.New`, `hmac.Equal`, `sync.Mutex`.

Correctness and teaching problems:
1. **One key per session, shared by both roles.** Each role must hold the key to tag its own packets, so role 0's player can forge a packet tagged as role 1 with a high sequence number. The relay then moves `addr[1]` to the attacker. The attacker receives the victim's traffic and the victim is cut off. The pitfall says "An attacker who knows a session id can then redirect the other player's traffic. Verify a tag first...", which implies the tag prevents redirection. It does not prevent it when the attacker is the other player. Fix: give each role its own key (for example, derive it with HMAC(sessionKey, role)), make the relay hold both keys, and say so in the pitfall.
2. **Replayed packets are still forwarded.** A replayed packet with `seq <= last` does not move the address, but it is still passed to the peer. The draft says "an attacker replaying an old packet moves nothing". That is true for the address, but the replayed payload still reaches the peer. Either drop packets that are not newer (and accept the cost of losing reordered packets), or keep a replay window like netcode's 256. Otherwise the text should say the endpoints must reject duplicates.
3. **`sessions` is a plain map read without a lock.** Any other goroutine that adds or removes sessions makes this a data race. The pitfall's "a limit on the sessions map" does not mention this. Add "guard or shard the map" to that list.
4. Smaller: the relay forwards the payload without the header, so the receiver cannot see the sequence or the session. That is acceptable for a sketch, but it should be stated.

**Godot snippet**
- The snippet never calls `peer.poll()`. The class reference says to call it frequently (for example in `_process`). Without it the channels never open, and `put_packet` fails before the connection is open. Add a `_process` that calls `peer.poll()`, or a comment saying that offer/answer signalling and polling are left out.
- Native (non-web) exports need the webrtc-native GDExtension. Add one sentence to `term` or `pitfall`.

**Unity snippet**
- Every API was confirmed. The signature and the default match the reference.
- A note would help: on a client, `SendNamedMessage` can only target the server (`NetworkManager.ServerClientId`). The method as written is server-side. Low priority.

## Teaching issues

1. Unity Transport's fragmentation stage defaults to an MTU of about 1,400 bytes. The topic's own trap warns against sending 1,400-byte packets. A Unity reader following the defaults hits that trap, so the draft should reconcile the two, for example: "Unity Transport assumes about 1,400; keep your own payloads under 1,200".
2. how[4] says "whole datagram". It should say UDP payload (see the claims table).
3. The relay-cost answer never applies the 12 per cent share and does not say the bitrates are invented (see the claims table).
4. The keepalive interval is stated as a rule with no source in the draft. Cite RFC 8445 s11 (Tr = 15 s).
5. Tailscale's "the other tenth" should read "up to a tenth, in their setting".
6. The Unity `map` text says WebRTC `ordered:true, maxRetransmits:0` is "close to" UnreliableSequenced. That is fair, but ordered partial reliability in SCTP can still hold later messages until the lost one is abandoned. A clause saying so would stop readers treating the two as identical. Optional.

## Missing coverage (against "Must cover")

- **Epic Online Services P2P relay**: the brief names it. The draft mentions it only in a TECH row title and makes no claim. The sources file says the official page could not be read. This is thin. Add at least what EOS relay control offers, from the EOS P2P docs (`dev.epicgames.com/docs/game-services/p-2-p`), or ask the coordinator to accept naming it only.
- **QUIC/HTTP/3, "where it is used"**: the draft says what QUIC fixes, but "where it is used" is limited to lobbies and live-ops. It could say that HTTP/3 is the backend and CDN case, citing RFC 9114 head-of-line framing, which the writer read. This is acceptable but thin.
- Everything else is covered: why UDP, reliability and redundancy, head-of-line blocking, WebSocket, WebRTC, STUN, TURN, hole punching, SDR, Unity Relay, DDoS and hidden IPs, MTU, fragmentation, loss and jitter numbers, and connection migration.

## Overlap with the sibling `server-bandwidth-and-interest-management`

Most of the content does not repeat: that draft covers interest management, quantisation and budgets, and this one covers transport and paths. There are two small duplications:
- Both drafts give the 28/48-byte headers and the "over about 1,200 bytes fragments and is lost if any fragment is lost" reasoning (sibling why[1], how and junior Q). This draft's junior Q2 ("What is MTU, and why ... under about 1,200 bytes?") asks the same question as the sibling's follow-up "Why is a payload over about 1,200 bytes risky?". Suggested fix: the sibling keeps the numbers as inputs to its arithmetic and moves the "why" to a link to this topic, or changes its follow-up question to something else. Not a blocker.
- The `rel` texts in both drafts already state this division of scope correctly.

## Style

- No US spellings found. A search for -ize/-yze, behavior, color and center found nothing; "initialize" occurs only as a Godot API name.
- No hype words. "simply" appears twice (why[2], Godot pitfall), in plain senses; it is acceptable.
- No owner employer, colleague or internal project is named. Public companies (Valve, Unity, Amazon, Tailscale, Epic) are allowed.

## Set aside

- The QUIC 1,200 figure is described as "QUIC assumes 1,200". Strictly, RFC 9000 assumes a 1,280-byte IP packet and requires support for a 1,200-byte payload. I flagged only the "whole datagram" wording, because the rest is a fair simplification.
- `createUnidirectionalStream` is not Baseline. The draft relies only on datagrams and bidirectional streams, which are Baseline.
- The GNS Nagle default value (not found on the page) is not flagged. The draft says "a few milliseconds" without giving a number.
- ICE "highest-priority pair that works": nomination is more nuanced (the controlling agent nominates). This is fine for the level of the topic.
- `hmac.New` allocates per packet in the Go relay. This is a performance point, out of scope for a sketch.
- The reading of bufferedAmount in traps[8] (client's TCP stream falling behind) is right for upstream. A downstream stall would show on the server side. I did not flag it; the trap is about the WebSocket send side.
- "Godot's default multiplayer sits on ENet": MultiplayerAPI does not depend on any one transport, but ENetMultiplayerPeer is the standard peer. Fair.
- The extra `rel` to server-bandwidth-and-interest-management is not in the brief's Rel list. It is useful and resolves with the sibling loaded.
- The ENGINE `map` claim that ENet unreliable-ordered equals UnreliableSequenced is a fair equivalence.
