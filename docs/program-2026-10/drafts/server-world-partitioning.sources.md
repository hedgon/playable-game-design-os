# Sources: server-world-partitioning

Read = page fetched 2026-10-05 through a summarising fetch tool (exact wording not verified). Summary only = search-result summary, page not read. Mine = my arithmetic or judgement, not a source claim.
Validate with both siblings loaded: PLAYABLE_DRAFTS=<this>.js,<server-bandwidth-and-interest-management>.js,<server-transport-and-relays>.js

## Cited claims

- EVE: solar system is the load-balancing unit; statically assigned to a node on one CPU core; hundreds of systems per node possible; a loaded system cannot be split; Character Nodes in Tyrannis, August 2010; about 8 character nodes of 204 sol nodes; Jita calls cut by up to 80 percent; Jita beyond the 1,400 pilot limit. https://www.eveonline.com/news/view/fixing-lag-character-nodes (read)
- EVE Time Dilation: clock slowed by queue of waiting work; examples 5 percent (extreme warp-in), 30 percent at 1,600 pilots, 60 percent at 1,200, 10 percent during jump operations; real-clock events (reinforcement timers) exempt; "super-tentative", implementation not before autumn 2011. https://www.eveonline.com/news/view/introducing-time-dilation-tidi (read). Published 2011-04-22 by CCP Veritas: from search results only.
- Floor of "probably 10 percent": CCP Veritas forum post, October 2011, per search summary only; the original blog did not fix it. https://forums-archive.eveonline.com/message/684653/ (summary only; the interview answer says "planned a floor around 10 percent")
- EVE GDC talk title "The Server Technology of EVE Online: How to Cope with 300,000 Players in One World", Kristjan Valur Jonsson, CCP, GDC China 2010; one unified world, Stackless Python. https://gdcvault.com/play/1014168/contactUs (read). Not cited in the draft's text except by implication.
- New World: grid with each cell a physical simulation volume; each hub covers two non-contiguous grid sections; four Remote Entry Points per group on C5.2xlarge, seven C5.9xlarge per group; state handed hub to hub; more than 7,000 AI entities and hundreds of thousands of objects for 2,500 players; DynamoDB about 800,000 writes every 30 seconds. https://aws.amazon.com/blogs/gametech/the-unique-architecture-behind-amazon-games-seamless-mmo-new-world/ (read). This is Amazon's own description; the draft says "as reported by AWS".
- WoW Classic layering: Brian Birmingham, Blizzard, Reddit AMA 2019-08-20: each layer a copy of the entire world; committed to one layer per realm before the second content phase; party invite moves a player to the inviter's layer. https://us.forums.blizzard.com/en/wow/t/layering-in-classic-blizzard-responds-on-reddit/260714 (read, a forum repost of the AMA)
- Layers add no capacity; Classic content not designed for sharding (Rexxar patrol example): Blizzard statements via search summary and a news relay. https://www.wowhead.com/news=294589/blizzard-clears-up-layering-tech-misconceptions-in-classic-wow (summary only; the page itself returned empty). The draft's "added no capacity by themselves" rests on this summary.
- Layering and exploits (duplication, economy): community criticism in search results; the draft states it as a known risk and does not attribute it to Blizzard. https://us.forums.blizzard.com/en/wow/t/examples-of-layering-exploits-and-problems/198240 (summary only)
- WoW connected realms: databases merged, shared guilds, trade and auction house; first connected 2013-10-25, bulk by 2014-10-08. https://warcraft.wiki.gg/wiki/Connected_Realms (summary only; community wiki, secondary). Blizzard's own announcement not found. Cross-realm zones put players of several realms in one zone instance: https://warcraft.wiki.gg/wiki/Cross-realm_zone (summary only).
- SpatialOS: Worlds Adrift, Mavericks: Proving Grounds and Lazarus closed in three consecutive months, Improbable statement 2019-08-13, different reasons each, "ambitious, visionary products always contain some risk". https://www.pcgamesinsider.biz/news/69519/ambitious-visionary-products-always-contain-some-risk-says-improbable-after-third-spatialos-project-bites-the-dust/ (read; trade press, secondary)
- Unity terms conflict, January 2019: Improbable said all SpatialOS games on Unity were in breach. https://pcgamesn.com/unity-improbable-spatialos (summary only, search result; the draft states it without detail). Worlds Adrift sunset: https://gameinformer.com/2019/05/29/bossa-studios-to-close-worlds-adrift (summary only).
- Fortnite Battle Royale: 100 players per dedicated server, 20 Hz target, server sends updates only for relevant actors. https://www.unrealengine.com/tech-blog/unreal-engine-improvements-for-fortnite-battle-royale (page returned 403; claim from search-result summary only; needs a re-read by the fact-checker)
- Agones: open source platform on Kubernetes for deploying, hosting, scaling and orchestrating dedicated game servers; Fleets and GameServers; allocation. https://agones.dev/site/docs/overview/ (read)
- Godot: ENetMultiplayerPeer.create_client, MultiplayerAPI.multiplayer_peer, connected_to_server, @rpc, rpc_id. https://docs.godotengine.org/en/stable/classes/class_enetmultiplayerpeer.html and https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html (memory, not fetched)
- Unity Netcode for GameObjects: NetworkManager.Shutdown, ShutdownInProgress, NetworkConfig.ConnectionData, StartClient; UnityTransport.SetConnectionData(string, ushort). https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.0/api/Unity.Netcode.NetworkManager.html (memory, not fetched)

## My arithmetic and judgement

- Pairs: n(n-1)/2 is 4,950 for 100 and 1,999,000 for 2,000; ratio about 404 (draft says "400 times"). 20x players gives 400x pairs.
- Bandwidth: 2,000 x 1,999 x 16 bytes x 20 Hz = 1.28 GB/s, about 10.2 Gbit/s. The 16 bytes and 20 Hz are illustrative.
- Handoff protocol (send, accept, acknowledge, release; version for idempotence), hysteresis margin, split at the median, split and merge thresholds apart: standard distributed-systems and game practice, my synthesis, no single source. A peer-reviewed paper on locality-aware dynamic load management for MMOGs (Chen et al., Toronto, https://www.eecg.utoronto.ca/~amza/papers/f87-chen.pdf) was found but the PDF could not be read, so it is not cited for any claim.
- "Contested" points: layers versus sharding terminology is Blizzard's and varies across the community; the draft follows Blizzard's usage.

## Could not verify

- A Blizzard-authored primary on modern WoW sharding and on connected realms.
- The exact EVE floor value in a CCP post (only a forum post summary).
- Fortnite figures from the Unreal tech blog text.
- Any primary on SpatialOS's technical limits; only trade-press statements.

## Changes after the fact-check (2026-10-05)

- Layering: removed the "added no capacity" clause. Birmingham's AMA repost (read) says layering is how Blizzard handled launch demand and layers are reduced as players spread; each layer is a whole-world copy; per-zone copies are sharding. Layer-change delays to curb abuse: Blizzard blue posts per the fact-checker, not re-read by me.
- 10 percent TiDi floor: now attributed to the live game, via EVE University's wiki (secondary, not fetched by me): https://wiki.eveuniversity.org/Time_Dilation . CCP's 2011 post says a hard limit is needed and does not fix it (read).
- "sol" nodes, as CCP writes them; Character Nodes deployed through August 2010 (fact-checker, same CCP page).
- New World non-contiguous hub sections: AWS gives no reason; the draft marks the reason as my inference.
- Connected realms: characters keep names with a realm suffix, Blizzard avoided forced renames (fact-checker, blue post quoted on https://warcraft.wiki.gg/wiki/Connected_Realms ; Engadget 2013-08-05 https://www.engadget.com/2013-08-05-world-of-warcraft-sews-together-realms-to-solve-population-issue.html ; secondary, not re-read by me). Cross-realm zones: https://warcraft.wiki.gg/wiki/Cross-realm_zone (summary only).
- Phasing: general description of per-player world-state filtering as in WoW; no primary read, stated without numbers.
- Memory example: illustrative figures, 2,000 x (50 KB + 64 KB) = 228 MB. Mine, not from a source.
- GDC China 2010 EVE talk now in FACTS: https://gdcvault.com/play/1014168/contactUs (read abstract only).
- Fortnite now in FACTS: Epic tech blog, 100 players, 20 Hz, minimise bandwidth. Page returned 403 to me; wording is from a search-result extract and the fact-checker's check of it.
- Unity dispute, January 2019: Unity's own post https://blog.unity.com/en/news/our-response-to-improbables-blog-post-and-why-you-can-keep-working-on-your-spatialos-game (from search results, not fetched). SpatialOS technical limits remain uncovered; the draft says the sources give business and licensing reasons only.
- Godot: SceneMultiplayer.auth_callback, peer_authenticating, send_auth, complete_auth, create_client returning Error (checked by the fact-checker on docs.godotengine.org). Unity: SetConnectionData(string ipv4Address, ushort port, string listenAddress = null) (fact-checker, Netcode for GameObjects 2.0 API reference). I did not run either snippet.
