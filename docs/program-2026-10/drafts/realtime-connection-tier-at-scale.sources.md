# Sources: realtime-connection-tier-at-scale

"Read" = fetched through a page-fetch tool that returns an extracted summary (not raw text). "Not read" = not opened, claim from memory or a neighbouring source.

## Claims from sources

- Discord: 5,000,000 concurrent users; session process (GenServer, WebSocket) talks to guild process on remote Erlang nodes; users average 5 guilds; send/2 costs 30-70 microseconds so a 30,000-user guild takes 900 ms to 2.1 s to fan out; Manifold groups PIDs by remote node; ring lookups 12 us per op, FastGlobal 0.3 us, reconnect lookup time 17.5 s to 750 ms. https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users (read, extracted).
- Discord: Midjourney server 1M+ concurrent of 10M+ members; quadratic-notification quote (1,000 online = 1 million, 100,000 = 10 billion); ~90% passive sessions, ~3x growth in max size; relays up to ~15,000 sessions each; relays stored full member lists (tens of seconds to serialise), then reduced; ETS and worker processes. https://discord.com/blog/maxjourney-pushing-discords-limits-with-a-million-plus-online-users-in-a-single-server (read, extracted). The topic paraphrases the quadratic claim ("grows with the square").
- WhatsApp: 2,277,845 sockets on one server, 24-core Xeon X5675, ~103 GB RAM, FreeBSD 8.2, Erlang R14B03, kern.ipc.maxsockets=2400000, 41.9% idle CPU. https://blog.whatsapp.com/1-million-is-so-2011 (read, extracted). The brief's "2M per server as reported" matches. The post is dated 2012; the topic says "2012".
- Slack: gateway servers and channel servers; channel servers mapped by consistent hashing; CHARMs manage the ring; replacement CS ready in under 20 s; ~16 million channels per host at peak; message delivery ~500 ms globally. https://slack.engineering/real-time-messaging/ (read, extracted). The topic uses only the consistent hashing, 20 s and 16 million figures.
- Redis Pub/Sub: at-most-once; disconnected subscriber loses message forever; Streams for persistence; sharded Pub/Sub from 7.0 with SSUBSCRIBE/SPUBLISH, messages within shard, less cluster-bus traffic; no relation to keyspace. https://redis.io/docs/latest/develop/pubsub/ (read, extracted).
- NATS core: at-most-once to connected interested subscribers; JetStream is persistence. https://docs.nats.io/nats-concepts/core-nats (read, extracted).
- NATS slow consumers: client pending-buffer overflow drops messages and keeps the connection; server closes a connection that misses its write deadline; Go client default 500,000 messages and 64 MB. https://docs.nats.io/running-a-nats-service/nats_admin/slow_consumers (read, extracted).
- Phoenix 2M connections: ulimit -n, fs.file-max and tcp_mem raised; early bottlenecks file descriptors (ulimit 1024) and a single pubsub server at 1.3M+; broadcast latency over 5 s improved to about 1 s; Tsung clients on separate machines. https://www.phoenixframework.org/blog/the-road-to-2-million-websocket-connections (read, extracted). Only "needed ulimit -n and fs.file-max raised" is used.
- epoll: ~160 bytes per registered descriptor on 64-bit; edge vs level triggered; max_user_watches. https://man7.org/linux/man-pages/man7/epoll.7.html (read, extracted).
- C10K (Dan Kegel): written 1999, ten thousand clients framing; epoll, kqueue, IOCP. http://www.kegel.com/c10k.html (read, extracted).
- Go FAQ: goroutines start with a few kilobytes of stack and grow. https://go.dev/doc/faq (read, extracted). "A few kilobytes" is the only size used.
- RFC 6455: close code 1001 going away; per-host connection limits in section 10.4. https://www.rfc-editor.org/rfc/rfc6455 (read, extracted). The extraction also claimed 1013 is in the RFC; that is doubtful (1013 is an IANA-registered code), so the topic cites 1013 to IANA: https://www.iana.org/assignments/websocket/websocket.xhtml (NOT READ; from memory).
- MQTT 5.0: QoS 0/1/2, retained messages, session expiry interval, shared subscriptions, keep alive, will. https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html (read, extracted).
- FCM: normal priority delayed in Doze, high priority can wake the device. https://firebase.google.com/docs/cloud-messaging/android/message-priority (read, extracted). Default TTL four weeks, max 2,419,200 s. https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-lifespan (read, extracted). Collapse keys exist in FCM (collapsible messages), source not read for details; the topic only says "collapse keys".
- APNs: payload 4 KB, apns-collapse-id 64 bytes, apns-priority 10/5/1. https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns (read, extracted; the extractor's summary was not checked against raw text, so recheck the exact priority values and the 4 KB figure).

## Not read, from memory or inference

- Redis `client-output-buffer-limit pubsub` default 32mb hard / 8mb soft for 60 s: the config page returned 404 and the raw redis.conf extract did not show the lines. NOT used in the topic text.
- Kafka: ordering within a partition, consumer groups, a partition read by one consumer per group. https://kafka.apache.org/documentation/ (page fetch returned only navigation; claim is from memory). Used in the interview answer ("durable partitioned log, ordered within a partition, with consumer groups") and the claim that Kafka is not built for millions of per-user subscriptions is the author's judgement.
- Docker/container fd limits ("in the container, not only on your laptop"): general practice, no source.

## Illustrative arithmetic (not sourced)

- 20,000 online members x 10 messages/s = 200,000 deliveries/s.
- 1,000,000 clients reconnecting over 60 s with full jitter = about 16,700/s.
- "Coalescing cuts syscalls and headers roughly tenfold" at 10 events per frame: arithmetic.
- 50-100 ms coalescing interval, and 30 s backoff cap: practitioner defaults, labelled as such; not from a source.
- Resetting backoff only after a connection has lived some seconds: practitioner heuristic.
- Go hub snippet was not compiled (Go not installed); reviewed by reading. Publish holds RLock while doing non-blocking sends; kicked clients are removed after RUnlock.

## Changes after the fact-check (2026-10-05)

- Relay count: "hundreds of relays" corrected to "dozens" (about 67 = 1,000,000 / 15,000). Source: Discord's large-guild post, which describes dozens of copies of the member list, one per relay (per the fact-check, read on the raw page). The 67 is arithmetic.
- Reconnect lookup cost: reworded to "about 30 seconds estimated, cut to 17.5 s then 750 ms" per the fact-check's reading of https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users (the 17.5 s was the figure after the first fix).
- Coalescing: "tenfold" made conditional on events per interval (arithmetic: saving equals events per interval).
- 50-100 ms interval, 30 s backoff cap, 10 s survival before reset: now labelled in the text as common starting points, not sourced values.
- Kafka and per-user subscriptions: labelled as the author's judgement with the reason given.
- Sticky sessions: added to how[] and trade[], labelled as the author's judgement (no source).
- C10M: added a clause. Source: https://en.wikipedia.org/wiki/C10k_problem (read on the raw page; secondary: it says C10M refers to 10 million concurrent connections in the 2010s). Robert Graham's C10M manifesto (c10m.robertgraham.com) could not be fetched, so no claim rests on it.
- BEAM process model: "a new process uses 327 words, 233 of them heap" from https://www.erlang.org/doc/system/eff_guide_processes.html (read on the raw page); added to why[0], how and FACTS. That Discord and WhatsApp run on the Erlang VM is from their posts already listed above.
- Slack channel clarification added to FACTS (from the fact-check's note on the same Slack page).
- FACTS URLs: added the core-nats page (NATS at-most-once), the FCM message-lifespan page (TTL), and switched WhatsApp to https://blog.whatsapp.com/196/1-million-is-so-2011?lang=en (the working URL).
- IANA 1013 (Try Again Later) now confirmed on the raw registry page https://www.iana.org/assignments/websocket/websocket.xhtml; the RFC 6455 text has no 1013.
- Code: Godot and Unity snippets now reset the attempt counter only after 10 s connected; Unity snippet no longer repeats the load-testing sibling's jitter maths (Backoff.FullJitter placeholder, said so in term) and keeps directory lookup, resume token and reset-after-survival; Godot inline match split into if/elif; Go comment now says the writer selects on Out and Done, Publish labelled drop-newest, and Leave deletes empty rooms. Go was not compiled (Go not installed); engine snippets not run.
- Explainer frame 3 renamed "Backoff without jitter: a wave".
