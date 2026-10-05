# Sources: server-transport-and-relays

Read = page fetched 2026-10-05 through a summarising fetch tool (exact wording not verified). Summary only = search-result summary, page not read. Memory = written from memory, not checked.
Validate with the sibling loaded: PLAYABLE_DRAFTS=<this>.js,<server-bandwidth-and-interest-management>.js (the `rel` to that draft does not resolve alone).

## Cited claims

- TCP: a dropped packet blocks later data; at 125 ms ping about 1/5 s to resend at best, half a second or more in bad conditions; Nagle; "don't mix TCP and UDP". https://gafferongames.com/post/udp_vs_tcp/ (read)
- Reliability on UDP: sequence, ack, 32-bit ack_bits, 33 acks per packet; resend messages not sent in last 0.1 s; reliable messages ride along until a packet containing them is acked; smoothed RTT. https://gafferongames.com/post/reliable_ordered_messages/ and https://gafferongames.com/post/reliability_ordering_and_congestion_avoidance_over_udp/ (read)
- Sequence wrap-around comparison (difference over half the range means the smaller is newer). Same second page (read). The 16-bit wrap at 60 pps (about 18 minutes) is my arithmetic: 65,536 / 60 = 1,092 s.
- Window of about 0.5 s at 60 pps for 32 acks: my arithmetic, 32 / 60.
- Connection handshake: challenge/response, random 64-bit salts, padded requests to prevent amplification, 5 s timeout. https://gafferongames.com/post/client_server_connection/ (read)
- netcode standard: connection request 1078 bytes; response must be smaller than request; payload 1 to 1200 bytes; 64-bit sequence as nonce, replay window 256 recommended. https://github.com/mas-bandwidth/netcode/blob/main/STANDARD.md (read)
- QUIC: Initial datagrams at least 1200 bytes; 1200 default assumed; 3x amplification limit; connection migration with connection ids and PATH_CHALLENGE; streams independent. https://www.rfc-editor.org/rfc/rfc9000.html (read)
- QUIC DATAGRAM frames not retransmitted, congestion controlled, max_datagram_frame_size default 0, gaming named as a use. https://www.rfc-editor.org/rfc/rfc9221.html (read)
- HTTP/3: HTTP/2 over TCP stalls all transactions on one loss; HTTP/3 delegates multiplexing to QUIC. https://www.rfc-editor.org/rfc/rfc9114.html (read; used only in the head-of-line framing, not quoted)
- IPv6 minimum link MTU 1280; routers do not fragment; IPv6 header 40 bytes (so UDP overhead 48 is my sum 40 + 8; IPv4 28 is 20 + 8). https://www.rfc-editor.org/rfc/rfc8200.html (read)
- Ethernet MTU 1500: general knowledge; Fiedler states real-world MTU 1500 on https://gafferongames.com/post/packet_fragmentation_and_reassembly/ (read by the sibling draft's writer, not re-read here). Fragment-loss compounding is taught there and only referenced here.
- ICE candidates and recommended type preferences 126/110/100/0; STUN binding checks. https://www.rfc-editor.org/rfc/rfc8445.html (read)
- TURN: allocation default 10 minutes; permission 5 minutes; channel bind 10 minutes; UDP/TCP/TLS/DTLS to server; relaying costs the provider bandwidth. https://www.rfc-editor.org/rfc/rfc8656.html (read)
- NAT UDP binding at least 2 minutes, 5 recommended; mapping and filtering behaviours. https://www.rfc-editor.org/rfc/rfc4787.html (read)
- Hole punching, hard NAT, birthday-paradox figures (174 probes 50%, 256 probes 64%, 1024 probes 98%); "over 90% of the time" direct. https://tailscale.com/blog/how-nat-traversal-works (read). The 90% is Tailscale's estimate for its own context, not a games statistic. In the topic it is attributed to Tailscale.
- WebRTC data channels: SCTP over DTLS over UDP; ordered/unordered, partial reliability; one SCTP association and one congestion window shared; about 16 KB message guidance. https://www.rfc-editor.org/rfc/rfc8831.html (read)
- Godot WebRTCPeerConnection.create_data_channel options (negotiated, id, maxRetransmits, maxPacketLifeTime, ordered); initialize iceServers format; WebRTCDataChannel getters. https://docs.godotengine.org/en/stable/classes/class_webrtcpeerconnection.html and https://docs.godotengine.org/en/stable/classes/class_webrtcdatachannel.html (read). Fact-checker: confirm put_packet comes from PacketPeer and the snippet runs on a native build (native builds need the webrtc-native extension, from memory).
- WebTransport: HTTP/3, streams and datagrams, secure contexts, Baseline 2026 "newly available since March 2026". https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API (read; the Baseline date is the most likely line to need rechecking against the compatibility table).
- WebSocket has no backpressure in the standard interface, bufferedAmount, TCP only. https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API (read)
- GameNetworkingSockets: reliable and unreliable messages, AES-GCM-256 per packet, fragmentation and reassembly above MTU, ICE for NAT traversal, SDR not offered on other platforms to all partners. https://github.com/ValveSoftware/GameNetworkingSockets (read)
- Steam Datagram Relay: IP addresses not revealed, protection from DoS, P2P relayed over Valve backbone when appropriate. https://partner.steamgames.com/doc/features/multiplayer/networking (read)
- ISteamNetworkingSockets send flags (Unreliable, Reliable, NoNagle, NoDelay) and Nagle batching. https://partner.steamgames.com/doc/api/ISteamNetworkingSockets (read; default Nagle time not stated, not cited)
- Unity Relay: allocation by max connections, join code, connection types udp/dtls/wss, WebGL needs wss and UnityTransport 2.0+ with UseWebSockets. https://docs.unity.com/en-us/mps-sdk/tutorials/relay-and-ngo.md (read). Standalone Relay package deprecated in Unity 6: same page (read).
- Unity Relay limit 150 players per session; no UDP on WebGL. https://docs.unity.com/en-us/mps-sdk/relay-limitations (read). Relay forwards all traffic, no direct peer link: https://docs.unity.com/ugs/en-us/manual/relay/manual/relay-servers (read).
- Unity Transport: reliable window default 32, maximum 64; fragmentation MTU roughly 1400; simulator delay 20 to 200 ms, jitter about half the delay, drop percentage rarely above 3 even on bad mobile. https://docs.unity3d.com/Packages/com.unity.transport@2.4/manual/pipelines-usage.html (read). "Window of 32 gives about 106 packets/s at 300 ms" is my arithmetic: 32 / 0.3.
- Amazon GameLift DDoS tiers: Shield Standard, Enhanced DDoS Protection (on by default, SDK 5), player gateway (opt-in relay, hides IPs, token per packet, rate limit per player). https://docs.aws.amazon.com/gameliftservers/latest/developerguide/ddos-protection-intro.html (read)
- Netcode for GameObjects: SendNamedMessage with FastBufferWriter and handler signature seen on https://mp-docs.dl.it.unity3d.com/netcode/2.3.2/advanced-topics/message-system/custom-messages (read). The fourth argument NetworkDelivery.UnreliableSequenced, its default (ReliableSequenced) and the claim that unreliable delivery is available are from memory and a search summary, NOT confirmed on a page: fact-checker must verify the SendNamedMessage overload takes a NetworkDelivery.

## Illustrative arithmetic (mine, not sourced)

- Relay cost example (bitrates invented, labelled illustrative in the topic): host plus 8 clients, 64 kbit/s down and 32 kbit/s up per client: host out 512 kbit/s, host in 256, relay carries 768 kbit/s each way (96 kB/s, 345.6 MB per hour per match); 10,000 fully relayed matches 7.68 Gbit/s each way. 12 per cent share: 1,200 matches x 768 kbit/s = 0.92 Gbit/s each way = 115 MB/s = about 0.41 TB per hour; per-pair ICE: 8 x 0.12 = 0.96 relayed legs per match x 96 kbit/s each way x 10,000 = 0.92 Gbit/s.
- 200 ms at 60 Hz is 12 snapshots (0.2 x 60).
- Keepalive: RFC 8445 section 11, Tr = 15 s and agents must not go below it (checked by the fact-checker on the plain-text RFC, not by me). "15 to 30 s" is practice. RFC 8656 notes some NATs expire bindings before 5 minutes. https://www.rfc-editor.org/rfc/rfc8445.html
- "Repeat the last three inputs per packet" is a common practice (cost: 3x upstream input bytes); no single source cited.

## Could not verify

- Epic Online Services P2P relay details (packet size, relay-control modes): the official page returned 404 or empty. The topic names EOS only in a TECH row title and makes no EOS-specific claim.
- Qualcomm, Apple or Android mobile loss and jitter statistics: none cited; the topic uses Unity Transport's simulator guidance as the only sourced loss figure.
- Where QUIC is used inside shipping games: no first-party source found, so the topic makes no such claim.
- Riot's network and DDoS practice: only secondary search summaries found, not used.

## Fact-check fixes applied 2026-10-05

- RFC 8445 FACTS line reordered: host 126, peer-reflexive 110, server-reflexive 100, relayed 0 (RFC 8445 section 5.1.2.2).
- "1,200 bytes of UDP payload" (RFC 9000 section 14); 1,280 minus 48 bytes of IPv6+UDP headers = 1,232 (RFC 8200 plus arithmetic).
- Tailscale figure reworded to "up to a tenth, in Tailscale's setting".
- Unity Transport fragmentation MTU about 1,400 (https://docs.unity3d.com/Packages/com.unity.transport@2.4/manual/pipelines-usage.html, read) is now named in the 1,400-byte trap and in how[4], with the advice to keep own payloads under 1,200.
- Go relay rewritten: one key per role derived by HMAC(master, role), packets dropped unless sequence is higher than the last seen (this also drops replays and reordered packets), sessions map behind an RWMutex. The Go code is still not compiled (Go not installed); the fact-checker read it line by line against the earlier version only.
- Godot snippet now calls peer.poll() in _process; native builds need the webrtc-native GDExtension (https://docs.godotengine.org/en/stable/tutorials/networking/webrtc.html, quoted from the fact-check, not read by me).
- Unity pitfall notes SendNamedMessage from a client can only target the server (fact-check, NGO API reference). Overload with NetworkDelivery confirmed by the fact-checker at https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.4/api/Unity.Netcode.CustomMessagingManager.html (supersedes the "from memory" note above).
- EOS: only a secondary source: "tries NAT punch-through and then automatically falls back to relayed communication" from https://docs.coherence.io/hosting/client-hosting/implementing-client-hosting/epic-online-services-eos-relay (read; a middleware vendor, not Epic). Epic's own pages returned 404 or empty, so no relay-control options or packet limits are stated.
- QUIC use: HTTP/3 on 40.8% of websites, W3Techs, October 2026. https://w3techs.com/technologies/details/ce-http3 (read). This is websites, not games; the topic says so. Still no first-party source for QUIC inside a shipped game.
- Frame 5 of the explainer: "more than one round trip (about 200 ms at a 125 ms ping)", per Fiedler's "1/5th of a second at best".
- Set aside by the fact-checker and left as is: ICE nomination nuance; GNS Nagle default value not stated.
