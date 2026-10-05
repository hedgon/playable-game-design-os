# Fact-check: realtime-connection-tier-at-scale

Checked 2026-10-05 against the draft `realtime-connection-tier-at-scale.js`, the writer's list `realtime-connection-tier-at-scale.sources.md`, `briefs/topics.md` (its section) and `briefs/topic-common.md`. Every claim the writer marked "read, extracted" or "NOT READ" was re-checked on the raw page with curl (tags stripped, then grep). Go is not installed: the Go snippet was read line by line against Go 1.23 and **was not compiled**. Godot and Unity snippets were not run in an engine; their APIs were checked on the official references.

## Verdict: PASS WITH FIXES

WRONG 2 · UNSUPPORTED 3 · OUTDATED 0.

Most serious: the draft says Discord's guild process sends to "hundreds of relays". At up to 15,000 sessions per relay and about 1 million online, that is about 67 relays, and Discord's own post says "dozens". Close behind it: both engine snippets reset the backoff counter the moment the socket opens, which is exactly what the Unity pitfall in the same entry tells readers not to do.

## Validation

- `PLAYABLE_DRAFTS=<this>,server-bandwidth-and-interest-management.js,server-transport-and-relays.js,server-load-testing-and-capacity.js,server-world-partitioning.js node src/validate.js` ends with `OK: all cross-links resolve, all topics complete.` I added server-world-partitioning only because the load-testing sibling links to it. This draft's own rel links all resolve.
- On its own the draft has 3 errors, one for each rel link to a sibling draft (bandwidth, transport, load-testing). These are expected until the siblings are integrated. **Integrate it with or after those three drafts.**
- Guide warnings: the Go snippet is 65 lines and 1,578 characters, over the 40-line guide (the character count is within the 1,800 limit). Nothing links to this topic yet, so it has no inbound links.
- **It repeats a sibling.** The Unity snippet is close to the Unity `Bot.Join` snippet in `server-load-testing-and-capacity.js`. Both use ClientWebSocket.ConnectAsync, catch WebSocketException, compute `Math.Min(30.0, …Math.Pow(2, attempt))` and wait a full-jitter `Task.Delay`. The tech card "Jittered backoff and resume tokens" also overlaps that sibling's "Full-jitter backoff" card. Keep the directory lookup, the resume token and the reset-after-survival rule here, and link to load-testing for the jitter maths, or change one of the two snippets.

## Claims

| Claim (short) | Field | Verdict | Correct value / note | Source |
|---|---|---|---|---|
| Discord 2017 post: 5,000,000 concurrent users | FACTS | CONFIRMED | July 6, 2017 | discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users |
| send/2 takes 30-70 µs, so a 30,000-user guild fan-out takes 0.9-2.1 s | FACTS | CONFIRMED | The post gives 30-70 µs and 900 ms-2.1 s "from a large guild" (r/Overwatch, 30,000 concurrent). Arithmetic: 30 µs × 30,000 = 0.9 s; 70 µs × 30,000 = 2.1 s | same |
| Ring lookup cost cut from 17.5 s to 750 ms by FastGlobal | FACTS | CONFIRMED | ETS reads (about 7 µs) left 17.5 s; FastGlobal (0.3 µs) brought it to 750 ms | same |
| "measured the ring lookups of one such burst at 17.5 seconds of CPU before fixing them" | why[3] | WRONG (minor) | The unfixed cost was an estimate of about 30 s (12 µs per request/reply lookup) after a session-server restart. 17.5 s was what remained after the first fix (ETS). It is time spent on lookups, not a CPU figure. Suggested wording: "about 30 seconds of lookups, cut to 17.5 s and then 750 ms" | same |
| Notifications grow with the square: 1,000 online → 1 million, 100,000 → 10 billion | why[1] | CONFIRMED | The post says "quadratically". 1,000² = 10⁶ and 100,000² = 10¹⁰ are correct | discord.com/blog/maxjourney-… |
| Server with over 1 million online users (Midjourney, 10M+ members) | FACTS | CONFIRMED | | same |
| About 90 per cent of user-to-large-guild connections passive | how[6], FACTS, interview | CONFIRMED | "around 90% of user-guild connections in large servers were passive" | same |
| Relays serve up to about 15,000 sessions each | how[5], tech, FACTS | CONFIRMED | "We handle up to 15,000 connected sessions per relay" | same |
| "the guild process sends to hundreds of relays, not millions of sessions" / "sends to hundreds of relays" | how[5], interview mid[2] | WRONG | About 1,000,000 ÷ 15,000 ≈ 67 relays. Discord says there were "dozens of copies" of the member list, one per relay. Say "dozens of relays" | same |
| Relays stored whole member lists, then stopped | tech | CONFIRMED | Creating a relay stalled the guild "for tens of seconds" | same |
| WhatsApp: 2,277,845 connections, 24-core, about 103 GB, FreeBSD 8.2, Erlang R14B03, 2012 | FACTS, interview | CONFIRMED | `kern.ipc.numopensockets: 2277845`, Xeon X5675, hw.ncpu 24, hw.physmem 103,062,118,400 bytes (103 GB, 96 GiB), FreeBSD 8.2-STABLE, R14B03, January 6, 2012. Note: the FACTS URL serves an error page to plain HTTP clients. The text was read at blog.whatsapp.com/196/1-million-is-so-2011?lang=en | blog.whatsapp.com |
| Slack: consistent hashing, replacement ready in under 20 s, about 16 million channels per host | how[8], FACTS | CONFIRMED | Slack's "channel" is an abstract id (users, teams, files and so on), so 16 million is not 16 million chat rooms. Worth half a clause | slack.engineering/real-time-messaging/ |
| Redis Pub/Sub at-most-once; a disconnected subscriber loses the message for good | traps, interview, FACTS | CONFIRMED | "the message is forever lost" | redis.io/docs/latest/develop/pubsub/ |
| Sharded Pub/Sub from 7.0, SSUBSCRIBE/SPUBLISH, kept inside the shard, less cluster-bus traffic | how[7], FACTS | CONFIRMED | | same |
| Core NATS at-most-once; JetStream persistence | trade, FACTS | CONFIRMED | FACTS cites slow_consumers, but the at-most-once statement is on the core-nats page. Cite that page too | docs.nats.io/nats-concepts/core-nats |
| Server closes a connection that misses its write deadline; Go client default 500,000 msgs / 64 MB | FACTS | CONFIRMED | | docs.nats.io/…/slow_consumers |
| Phoenix 2M benchmark had to raise ulimit -n and fs.file-max | how[1], interview | CONFIRMED | ulimit -n returned 1024 (1k connections). fs.file-max, ulimit and tcp_mem were then raised | phoenixframework.org/blog/the-road-to-2-million-websocket-connections |
| epoll: about 160 bytes per registered fd on 64-bit | how[2], FACTS | CONFIRMED | "roughly 160 bytes on a 64-bit kernel" | man7.org epoll(7) |
| C10K is a 1999 framing, ten thousand clients | why[0] | CONFIRMED | The term was coined by Kegel in 1999. The page itself cites cdrom.com's 10,000 clients in 1999 | kegel.com/c10k.html; Wikipedia C10k problem |
| Goroutine stack of a few kilobytes | how[0] | CONFIRMED | "A newly minted goroutine is given a few kilobytes" | go.dev/doc/faq |
| 1001 going away in RFC 6455; 1013 Try Again Later in IANA registry | how[10], FACTS | CONFIRMED | 1013 is registered by the IANA, not defined in RFC 6455 (the writer's correction stands) | rfc-editor.org/rfc/rfc6455; iana.org/assignments/websocket |
| MQTT 5: QoS 0/1/2, retained, session expiry, shared subscriptions | how[11], FACTS | CONFIRMED | | docs.oasis-open.org mqtt-v5.0 |
| FCM normal priority delayed in Doze; high can wake; TTL default four weeks, max 2,419,200 s | FACTS | CONFIRMED | 2,419,200 s = 28 days. The TTL half is on the "setting-message-lifespan" page, not the priority page in `src`. Add that URL | firebase.google.com (both pages) |
| APNs 4 KB payload, apns-collapse-id up to 64 bytes, priority 10/5/1 | FACTS | CONFIRMED | 4 KB (4096 bytes); VoIP 5 KB | developer.apple.com (doc JSON) |
| Kafka: durable partitioned log, ordered within a partition, consumer groups | interview mid[1] | CONFIRMED | | Kafka docs, getting-started/introduction.md (3.9) |
| Kafka's "consumer model is not built for millions of per-user subscriptions" | interview mid[1] | UNSUPPORTED | It is the writer's judgement (sources.md says so) but it is stated as fact. Mark it as a judgement, or give the reason (topics and partitions are coarse; per-user filtering happens downstream) | none |
| "Coalescing a tenth of a second … cuts syscalls and headers roughly tenfold" | trade[3] | UNSUPPORTED | True only if a client gets about 10 events per 100 ms. At 2 events per interval the cut is 2×. Make it conditional ("by the number of events per interval") | arithmetic |
| 50-100 ms coalescing interval; 30 s backoff cap | tech, engine snippets | UNSUPPORTED | sources.md calls these "practitioner defaults, labelled as such", but the draft does not label them. Add "a common starting point, not a sourced value" | none |
| 20,000 × 10 msg/s = 200,000 deliveries/s | interview jr[0] | CONFIRMED (arithmetic) | | |
| 1,000,000 over 60 s ≈ 17,000/s | interview jr[2] | CONFIRMED (arithmetic) | 16,667/s. This assumes the reconnects spread evenly over the window, which a full-jitter window gives on the first attempt | |
| Godot cap `minf(30.0, pow(2.0, _attempt))` | engine | CONFIRMED (arithmetic) | The cap reaches 30 at attempt 5 (32 → 30) | |

## Code issues

APIs confirmed on the official references:
- **Godot 4:** WebSocketPeer `poll()`, `get_ready_state()`, `connect_to_url(url, tls_client_options = null)` returning Error, `STATE_OPEN` = 1 and `STATE_CLOSED` = 3, `SceneTree.create_timer(time_sec, …)`, and `minf`, `pow`, `randf` in @GlobalScope.
- **Unity 6:** `Random.value` (float in [0, 1], both ends inclusive).
- **.NET:** `ClientWebSocket.ConnectAsync(Uri, CancellationToken)` and `Task.Delay(TimeSpan, CancellationToken)`.

There is no API I could not confirm.

1. **Both engine snippets contradict the entry's own pitfall.** Godot sets `_attempt = 0` on every frame where the state is `STATE_OPEN`, and Unity sets `attempt = 0` straight after `ConnectAsync`. The Unity pitfall says to reset "only after the connection has stayed up for some seconds". Make the snippets follow it: for example, reset in Godot once the connection has been open for N seconds, and in Unity after `Pump` returns having run longer than N.
2. **The Go droppable path drops the newest frame.** how[4] and the tech card say that for superseded state you "keep only the latest and drop the rest". On a full queue, `Publish` skips the *new* message and keeps the stale queued ones, so a slow client keeps old positions. Either call the policy "drop newest" in the comment and the text, or show a keep-latest variant (for example, a 1-slot channel drained and refilled).
3. **The Go comment "A writer goroutine ranges over Out until Done closes" is inaccurate.** A `range` over `send` cannot see `done`, and `send` is never closed, so that writer never exits. The pitfall correctly says to select on both. Change the comment to "selects on Out and Done".
4. Go, minor: `Leave` never deletes an empty room map, so the map grows with every room ever used. The Go code was read, not compiled. Otherwise it is valid Go 1.23: the import is used, the named results are fine, `delete` on a nil inner map does nothing, there is no send on a closed channel, and `Close` is idempotent through `sync.Once`.
5. Godot, unverified: `WebSocketPeer.STATE_CLOSED: if not _waiting: _retry()` nests an inline `if` inside an inline match branch. I believe GDScript 2.0 accepts it but I did not run it. Splitting it over two lines removes the doubt and reads better.
6. Unity: `Directory.NextGatewayAsync`, `Directory.next_gateway()` and `Pump` are undefined placeholders, and `using System; System.Net.WebSockets; System.Threading; System.Threading.Tasks;` are omitted. That is acceptable under the snippet-length limit, but say in `term` that they are placeholders. `OperationCanceledException` from `Task.Delay` propagates on cancellation, which is fine.

## Teaching issues

- Explainer frame 3 has the caption "Fixed retry: a wave" but draws retries at 1 s, 2 s and 4 s. That is exponential backoff without jitter, not a fixed retry. Rename it to "Backoff without jitter: a wave", or draw a fixed 1 s retry.
- The "hundreds of relays" error (above) also inflates how much two-stage fan-out saves in the reader's mental model.
- The coalescing "tenfold" saving and the unlabelled 50-100 ms and 30 s values (above) are tricks presented without the condition they depend on.
- `trade[4]` (sticky routing) is right, but sticky sessions get one sentence while the brief names them explicitly (see coverage).

## Missing or thin coverage (brief "Must cover")

- **C10M framing**: missing. Only C10K is mentioned.
- **Sticky sessions**: thin. There is one trade-off line and nothing in how[] or tech.
- **BEAM processes as a model**: adequate for Discord. WhatsApp appears only in FACTS and one interview answer, and the draft never explains why a lightweight process per connection is the model (how[0] mentions it in passing).
- Everything else is covered: memory per connection, epoll/kqueue, fd limits, gateway versus logic tier, presence, Redis/NATS/Kafka, the 100,000-member channel, batching, backpressure, reconnect storms, sharding by room, mobile push versus sockets, and MQTT.

## Style

No hype words, no US spellings found (I grepped `-ize`, behavior, color, center, favor, crucial, robust, leverage, delve) and no employer or internal names. Public companies only.

## Set aside

- The "Discord's large-community fix" for presence: passive sessions cover all guild events, not only presence. Not flagged, because presence is included and the sentence is not wrong.
- Phoenix "before anything else worked": slightly dramatised, but the post does show a 1k cap from ulimit 1024 before the changes.
- Using the NATS "per subscription" wording for the Go pending limits: Go client limits are set per subscription. Not flagged.
- Docker and container fd limits (verify[3]): general practice, consistent with how container ulimits work. Not a factual claim that needs a source.
- RFC 6455 §10.4 per-host connection limits and Slack's 500 ms delivery: in sources.md but not used in the draft.
- `_retry()` is called without `await` from `_process`: valid in Godot 4 (the coroutine runs detached), and the `_waiting` flag prevents re-entry.
- UnityEngine.Random.value after `await`: Unity's synchronisation context resumes on the main thread, so it is safe.
- WhatsApp's "about 103 GB": decimal GB from hw.physmem. It is 96 GiB, which the draft does not need to state.
