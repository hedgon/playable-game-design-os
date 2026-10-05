# Fact-check: server-world-partitioning

Checked 2026-10-05 against the draft, its `.sources.md`, `briefs/topics.md` (section `## server-world-partitioning`) and `briefs/topic-common.md`.

## Verdict: PASS WITH FIXES

Validation: `PLAYABLE_DRAFTS=<this>.js,server-bandwidth-and-interest-management.js,server-transport-and-relays.js node src/validate.js` ends with `OK: all cross-links resolve, all topics complete.` Expected lines: `DRAFT not in any learning path` and `WARN topics with no inbound links: server-world-partitioning`. This draft is not in the LONG list.

Counts: WRONG 3, UNSUPPORTED 2, OUTDATED 0.

Most serious issue: the Layering TECH row says Blizzard stated that layers "added no capacity by themselves". Blizzard's primary statement says the opposite. Layering exists to hold the launch crowd, and layers are reduced as players spread out.

## Claims

| Claim (short) | Location | Verdict | Correct value / note | Source |
|---|---|---|---|---|
| 100 players ≈ 5,000 pairs; 2,000 ≈ two million; "400 times" | why[0], interview junior[0] | CONFIRMED (computed) | n(n-1)/2 = 4,950 and 1,999,000. Ratio 403.8. 20× the players gives ≈400× the pairs. | node: `p(100)=4950, p(2000)=1999000` |
| 2,000 × 1,999 × 16 B × 20 Hz ≈ 1.3 GB/s ≈ 10 Gbit/s | why[0] | CONFIRMED (computed) | 1,279,360,000 B/s = 1.28 GB/s (1.19 GiB/s) = 10.23 Gbit/s. The 16 B and 20 Hz are illustrative and the text says so. | node arithmetic |
| EVE: solar system is the load-balancing unit, statically assigned to a node on one CPU core, cannot be split | facts[0], TECH single shard | CONFIRMED | Matches the source almost word for word. The node is single-threaded, so one process is one core. | https://www.eveonline.com/news/view/fixing-lag-character-nodes (CCP Atlas, 2010-08-28) |
| "204 solution nodes in the cluster" | facts[0] | UNSUPPORTED (wording) | The source says "204 sol nodes". It never expands "sol" to "solution". Write "204 'sol' nodes" or "204 server nodes". | same |
| Jita capped at about 1,400 pilots until the Character Nodes change of August 2010 | facts[0] | CONFIRMED, minor date fix | "Beyond the 1400 pilot limit". Character Nodes started in Tyrannis (May 2010) and shipped piecemeal through August. Phase 2 went out on 12 August 2010. Say "deployed through August 2010". | same |
| "CCP's 2010 write-up of EVE's architecture" | facts[0] | CONFIRMED, framing | The source is a dev blog about one optimisation, Character Nodes. It explains part of the architecture but is not a general architecture write-up. | same |
| TiDi blog April 2011: clock slowed by the queue of waiting work; ~5% at warp-in, ~30% at 1,600, ~60% at 1,200; reinforcement timers exempt; "tentative" | facts[1] | CONFIRMED | 2011-04-22, CCP Veritas. All figures are in the text as illustrations ("super-tentative"). | https://www.eveonline.com/news/view/introducing-time-dilation-tidi |
| "CCP … in its 2011 post … planned a floor around 10 percent" | interview senior[0] | WRONG (attribution) | The 2011 post says a hard limit would be needed and "I don't know where that threshold will be". It mentions 10% only as the example rate while a fleet jumps out. The live floor is 10% (one game second takes ten real seconds), but only a secondary source supports that. The writer's forum source (forums-archive message 684653) returned 503 and the archived copy returned 429, so it was not read. Fix: "the live system bottoms out at 10 percent", cited to EVE University or a CCP post if one is found. Keep this apart from the 2011 post. | TiDi blog above; https://wiki.eveuniversity.org/Time_Dilation (secondary) |
| New World: >7,000 AI entities, hundreds of thousands of objects, 2,500 players; each hub covers two non-contiguous grid sections; state handed hub to hub; DynamoDB ~800,000 writes / 30 s | facts[2], interview senior[2] | CONFIRMED | The source says "two nonconsecutive subdivisions of a grid". Other wording matches. | https://aws.amazon.com/blogs/gametech/the-unique-architecture-behind-amazon-games-seamless-mmo-new-world/ |
| New World hubs own non-contiguous sections "so a crowd in one area does not land on one machine only" | interview senior[2] | UNSUPPORTED (inference) | AWS does not give a reason for the non-contiguous split. Present it as the writer's reading ("presumably to spread…"), not as part of what AWS reported. | same |
| WoW Classic: Brian Birmingham, Aug 2019 AMA; every layer is a copy of the entire world; committed to one layer per realm before phase 2; invite moves the invitee to the inviter's layer | facts[3], TECH layering | CONFIRMED | Lead Software Engineer, 2019-08-20, quoted in full in the forum repost. Primary: the r/classicwow AMA. | https://us.forums.blizzard.com/en/wow/t/layering-in-classic-blizzard-responds-on-reddit/260714 |
| "Blizzard said layers … added no capacity by themselves" | TECH layering `cost` | WRONG | The same statement says layering is how Blizzard supports launch demand, as an alternative to realm caps and queues. Layers are reduced as players spread out. Each layer holds its own share of the population, so it does add capacity. The writer only had a Wowhead summary for this, and Wowhead relays the same AMA. Remove the clause. | same |
| Classic content not designed for (per-zone) sharding | TECH layering `cost` | CONFIRMED | "while modern WoW has content designed to work with sharding, WoW Classic does not". Rexxar's patrol path is the example. | same |
| "Layers duplicate a busy zone" / row named "Layering and sharding of one zone" | what, TECH n | WRONG (as a description of layering) | Blizzard's layering copies the whole world. Per-zone copies are modern WoW sharding. As written, the topic mixes the two terms that `.sources.md` says it follows Blizzard's usage for. Fix: "Layers duplicate the whole world (or, as sharding, one busy zone)…" | same |
| Connected realms from 2013, merged databases, shared guilds, trade and auction house | TECH shards `cost`, interview senior[3] | CONFIRMED (secondary for "databases") | Patch 5.4, 10 Sep 2013. The first connections in the wiki list date from late Sep and Oct 2013. "Databases merged" is the wiki's wording; no Blizzard primary was found. | https://warcraft.wiki.gg/wiki/Connected_Realms ; Patch 5.4 (warcraft.wiki.gg/wiki/5.4) |
| Connected-realm migration: "make names unique with a rename step … what the player loses (names)" | interview senior[3] | WRONG for WoW (teaching) | Blizzard chose connected realms instead of merges to avoid forced renames. Characters keep their names, with a "-Realm" suffix as the namespace. Its blue post: merging "would require us to force character name changes". As general advice a rename step is one option. The answer should name the suffix namespace as the alternative Blizzard used, and should not say WoW players lost their names. | blue post quoted on warcraft.wiki.gg Connected_Realms; Engadget 2013-08-05 |
| Improbable, Aug 2019: three SpatialOS games closed in three consecutive months (Worlds Adrift, Mavericks, Lazarus), different reasons, did not blame the platform | facts[4], interview senior[1] | CONFIRMED (trade press quoting the company) | 2019-08-13. The statement was given to GamesIndustry.biz: "ambitious, visionary products always contain some risk". | https://www.pcgamesinsider.biz/news/69519/... |
| Licensing conflict with Unity in January 2019 | interview senior[1] | CONFIRMED | Unity's own post of 2019-01-10/11 says Improbable was in breach of its terms of service. Unity revised its terms within the week. Cite Unity's post. | https://blog.unity.com/en/news/our-response-to-improbables-blog-post-and-why-you-can-keep-working-on-your-spatialos-game (from search results; page not fetched) |
| Fortnite: 100 players per match server | interview junior[2], TECH match `fit` | CONFIRMED (Epic text via search snippet) | Epic's tech blog: the server had to "handle 100 simultaneous players, maintain 20Hz, and minimize bandwidth". The page returns 403 to curl and WebFetch, and the archive.org copy returned 429. Epic's wording came through the search engine's extract of that page, not a direct read. The draft never ties 20 Hz to Fortnite; it uses 20 Hz only as an illustration. Citing Epic for the 20 Hz would strengthen why[0]. | https://www.unrealengine.com/tech-blog/unreal-engine-improvements-for-fortnite-battle-royale |
| Agones: open source platform on Kubernetes for hosting, scaling and orchestrating dedicated game servers, with allocation | facts[5], TECH match | CONFIRMED | | https://agones.dev/site/docs/overview/ |

## Code

Godot 4. Every API was checked on docs.godotengine.org/en/stable:
- `ENetMultiplayerPeer.create_client(address, port, channel_count=0, in_bandwidth=0, out_bandwidth=0, local_port=0) -> Error`: confirmed.
- `MultiplayerAPI.multiplayer_peer` and the `connected_to_server()` signal: confirmed.
- `Node.rpc_id(peer_id, method: StringName, ...)`: confirmed.
- `Object.CONNECT_ONE_SHOT = 4`: confirmed.
- `@rpc("any_peer","call_remote","reliable")`: valid annotation arguments.

Issues:
1. The snippet is 17 lines. The brief allows 15 or fewer; the validator does not check this.
2. Retry bug. The pitfall says to retry with backoff. If a connect fails, `connected_to_server` never fires, so the ONE_SHOT connection stays attached. A second `on_handoff` call then connects the same callable again, and Godot reports an error that the signal is already connected. Disconnect it on `connection_failed`, or check `is_connected` first.
3. The `create_client` return value is ignored. A bad address fails silently.
4. Teaching: Godot has a built-in pre-acceptance handshake for this, `SceneMultiplayer.auth_callback` / `send_auth` / `complete_auth` (signals `peer_authenticating`, `peer_authentication_failed`). It presents the ticket before the peer counts as connected, which matches the Unity version's connection approval. An RPC after connect admits the peer first and checks the ticket afterwards. Name `send_auth` at least in the pitfall.
5. "drops the old zone's peer": I did not confirm whether replacing `multiplayer_peer` closes the old ENet connection gracefully. An explicit `multiplayer.multiplayer_peer.close()` first gives the old zone a clean disconnect rather than a timeout. Low confidence; not checked in engine source.

Unity 6 (Netcode for GameObjects 2.0 API reference, docs.unity3d.com):
- `NetworkManager.Shutdown(bool discardMessageQueue = false)`, `ShutdownInProgress { get; }`, `bool StartClient()`, `NetworkConfig.ConnectionData` (byte[]) and `UnityTransport.SetConnectionData(string ipv4Address, ushort port, string listenAddress = null)`: all confirmed.
- Teaching: the first parameter of `SetConnectionData` is documented as `ipv4Address`. The handoff should send an IP literal, not a DNS name; the Godot side resolves hostnames. Worth one clause, since the topic tells clients to treat the zone address as short-lived.
- `StartClient()`'s bool is ignored. That is acceptable for a sketch.
- 15 lines, 555 characters.

Go. Read line by line against Go 1.23. Not compiled: Go is not installed.
- Both imports (`math`, `slices`) are used. `slices.Clone` and `slices.Sort` on `[]float64` are valid (float64 satisfies `cmp.Ordered`). `int(math.Floor(...))` is a valid conversion. The closure `lo` is typed correctly. The package needs no `main`.
- I expect it to compile. The logic is right: hysteresis box of ±Margin around the current cell. `SplitAt` returns the upper median, and its comment states the non-empty precondition.

## Missing or thin coverage (against "Must cover")

- Cross-realm: listed in the brief. It appears only in `.sources.md` (cross-realm zones), not in the draft. Add one sentence or a TECH note: cross-realm zones put players of several realms in one zone instance, a lighter step than connected realms.
- Phasing: the brief says "layering/phasing". Phasing appears only as "an instance or phase" in one interview answer. Phasing is per-player world state, different from layering's capacity copies, and needs a line.
- Memory: named in why/interview, but no number or example. CPU and bandwidth both have one.
- SpatialOS "limits as a lesson": covered through business outcomes (closures, licence dispute) only, with no technical limit. `.sources.md` admits this. Acceptable if marked as such.
- "Published talks": none cited. The writer found the GDC China 2010 EVE talk (Kristjan Valur Jonsson) but did not use it.
- Fortnite figures have no FACTS entry. Add one with Epic's blog, which supports both the 100 and the 20 Hz.

## Teaching issues

- The layering fixes are covered in the table above.
- trade[2]: "allow duplication exploits unless the economy is global". The economy is realm-wide in any case. The real exploit is layer-hopping to re-farm nodes, rares and kills. The fix is a rate limit on layer transfers, which Blizzard added (transfer delay, longer after PvP). Reword.
- traps[0]: "A zone at 20 percent of the average player count and 300 percent of its entities in one place" is hard to parse. Suggest: "A zone with a fifth of the average population, all standing in one square, is the one that falls over."
- The connected-realm interview answer: see the table. Blizzard's own design avoided renames.
- The New World inference is presented as reported; see the table.

## Style

- why[0] contains "(my arithmetic)". First person does not belong in site text. Use "(illustrative figures)" or similar.
- No hype words. No US spellings found in a scan for -ize, color, center, behavior, optimiz-.
- No employer, colleague or internal project named.

## Sibling overlap

Loaded with both siblings:
- server-bandwidth-and-interest-management touches the quadratic cost ("At 100 players that is 10,000 distance checks") and defers splitting to this topic. This draft defers interest management back. That is no duplication.
- The two topics count pairs differently: 10,000 ordered pairs (N²) against 4,950 unordered (n(n-1)/2). Both are correct; the coordinator may want one convention across siblings.
- server-transport-and-relays has no handoff, shard or ticket content; no overlap.
- Existing `server-scaling` has a "partition of players" TECH row that overlaps the "Shards or realms" row in a few words. The `rel` line explains the split; acceptable.

## Set aside

- EVE's site footer now credits "Fenris Creations" as rights holder. The draft's "CCP" is correct for 2010 and 2011 posts, so not flagged.
- "Lead Software Engineer" title for Birmingham: correct per the repost, and the draft does not give a title.
- The connected-realm first date ("from 2013"): `.sources.md` says 2013-10-25, but the wiki list starts 2013-09-25. The draft only says "2013", so no fix.
- Agones TECH description "Fleets and GameServers": consistent with the docs; not quoted in the draft.
- The TiDi TECH `how` ("if the work queue … grows past what it can finish in a tick"): a fair paraphrase of "maintain a very small queue of waiting tasklets".
- Go `SplitAt` on empty input: the caller precondition is stated, and a guard would be an invented problem.
- Unity `GetComponent<UnityTransport>()` instead of `NetworkConfig.NetworkTransport`: both work.
- The EXPLAINER block: frames are coherent, within 3 to 8, and the split/merge thresholds match the `how` text.
- `facts` and `tech` inside `T(...)` instead of separate `FACTS()` / `TECH()` calls: the validator accepts it. The coordinator can decide whether to normalise.
