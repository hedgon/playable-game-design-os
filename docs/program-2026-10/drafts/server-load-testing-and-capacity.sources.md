# Sources: server-load-testing-and-capacity

"Read" means the page itself was fetched through a page-fetch tool that returns an extracted summary of that page (not the raw text). "Search only" means only a search-result snippet was seen.

## Claims from sources

- SRE: client-side adaptive throttling, K=2, two-minute window of requests/accepts; per-request retry cap three attempts; per-client retry ratio under 10%; four criticality levels. https://sre.google/sre-book/handling-overload/ (read, extracted). The formula itself (rejection probability) was not extracted; the topic describes it in words only.
- SRE: test until failure, test recovery, randomised exponential backoff, bounded queues, deadline propagation, GC death spiral, cold caches. https://sre.google/sre-book/addressing-cascading-failures/ (read, extracted). The "bounded queue at 50% of thread pool" figure was NOT used.
- k6 test types (six) and shapes. https://grafana.com/docs/k6/latest/testing-guides/test-types/ (read, extracted).
- k6 open vs closed model, executors, coordinated omission coupling. https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/ (read, extracted).
- Gatling open/closed injection steps. https://docs.gatling.io/concepts/injection/ (read, extracted).
- Locust: gevent users, constant_throughput/poisson wait times, master/worker (only mentioned as a tool in the brief; no number claimed). https://docs.locust.io/en/stable/writing-a-locustfile.html (read, extracted).
- Coordinated omission and HdrHistogram (Gil Tene, "How NOT to Measure Latency"). https://qconsf.com/sf2012/dl/qcon-sanfran-2012/slides/GilTene_HowNotToMeasureLatency.pdf (search result only; not opened).
- Riot VALORANT load testing: Go harness, ~10,000 players per process on four CPUs, 200 containers for two million, three-hour run, mock game server 500+ games per core, doubling per test, under two weeks before launch. https://www.riotgames.com/en/news/scalability-and-load-testing-valorant (read, extracted).
- Nakama 2M CCU test: Artillery, ~25,000 Fargate nodes, ~50 minute ramp, four-hour scenarios. https://aws.amazon.com/blogs/gametech/how-code-wizards-load-tested-heroic-labs-nakama-to-two-million-concurrent-players-with-aws (read, extracted). The "80 per node" figure was not stated; avoid.
- Metaplay BotClient (headless client for load testing, functional testing, economy simulation). https://docs.metaplay.io/feature-cookbooks/automated-testing/botclient-testing (read, extracted; not a numeric claim in the draft).
- Pokemon GO launch: 50x target, ~10x worst case, 15 minutes after Australia/New Zealand launch. https://cloud.google.com/blog/products/containers-kubernetes/bringing-pokemon-go-to-life-on-google-cloud (read, extracted).
- AWS retry amplification (243x in five layers at three retries), single-layer retry, token bucket. https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/ (read via its redirect target builder.aws.com, extracted).
- AWS goodput vs throughput, test beyond the break, shed early. https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/ (read via redirect target, extracted).
- AWS jitter variants and 100-client contention result ("reduced our call count by more than half"). https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/ (read, extracted). Draft says "any jitter more than halved the calls"; the source says jittered backoff did, compared with non-jittered exponential.
- GameLift target-based scaling, PercentAvailableGameSessions, seconds vs minutes. https://docs.aws.amazon.com/gameliftservers/latest/developerguide/fleets-autoscaling-target.html (read).
- GameLift scaling overview (target-based recommended as the simplest). https://docs.aws.amazon.com/gameliftservers/latest/developerguide/fleets-autoscaling.html (read).
- Agones FleetAutoscaler Buffer/Webhook/Counter/List, 30s default sync. https://agones.dev/site/docs/reference/fleetautoscaler/ (read, extracted).
- Linux: ip_local_port_range default 32768-60999, somaxconn 4096 since 5.4. https://www.kernel.org/doc/html/latest/networking/ip-sysctl.html (read, extracted). The per-source-IP port ceiling (~28,000 connections to one destination IP:port) is my arithmetic: 60999-32768+1 = 28,232; it is not in the draft's text beyond "ports used up".
- RLIMIT_NOFILE, EMFILE, nr_open bound. https://man7.org/linux/man-pages/man2/getrlimit.2.html (read, extracted).
- Go GC guide: GOGC=100, GOMEMLIMIT (1.19), thrashing. https://tip.golang.org/doc/gc-guide (read, extracted).
- Godot --headless. https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html (read, extracted). The "60 physics ticks per second default" is from memory of Godot's project setting (physics/common/physics_ticks_per_second); not re-fetched.
- Unity -batchmode / -nographics. https://docs.unity3d.com/Manual/PlayerCommandLineArguments.html (read, extracted).
- Little's law L = lambda W. J.D.C. Little, Operations Research 9(3), 1961. https://doi.org/10.1287/opre.9.3.383 (search result only; not opened).
- Principles of Chaos: definition and five advanced principles. https://principlesofchaos.org/ (read, extracted).

## Illustrative, not sourced

- Login example (50/s x 2 s = 100 in flight, 10 s = 500, pool 200) and the 30 Hz tick budget (33 ms) are arithmetic.
- "Start with the load at which tick p99 reaches 60 to 70 per cent of budget" is a practitioner heuristic, labelled as a starting point, not a cited figure.
- "Generator below about 70% CPU" is a rule of thumb, not sourced.
- .NET: unseeded System.Random instances created close together can share a time-based seed on older runtimes; from memory, not verified for Unity 6.
- Diablo III's 2012 launch (Error 37) was considered and not used: only secondary news snippets were found.

## Fact-check corrections (2026-10-05)

Applied from server-load-testing-and-capacity.factcheck.md. Sources below were verified raw by the fact-checker unless noted.

- Pokemon GO: reworded. The 50X surge is stated as "quickly surged"; the 15 minutes applies only to traffic passing expectations. why[2], interview senior[1] and the FACTS row now say "surged to" and keep the 15-minute statement separate. https://cloud.google.com/blog/products/containers-kubernetes/bringing-pokemon-go-to-life-on-google-cloud
- Riot 10,000 per process: now described as a platform harness making service calls (party, matchmaking, store), not gameplay inputs at tick rate, with a warning not to budget tick-rate streams from it. https://www.riotgames.com/en/news/scalability-and-load-testing-valorant
- k6 "ramp" attribution: removed. The ramp-and-hold maps to k6's average-load test (stress if held above peak); smoke, soak, spike and breakpoint also exist. https://grafana.com/docs/k6/latest/testing-guides/test-types/
- k6 open vs closed and coordinated omission: split into its own FACTS row with the open-vs-closed page as source. https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/
- AWS jitter: "more than half" now attributed to full jitter only; all three variants "cut down work substantially"; full jitter cost reworded (some sleeps are very short; equal jitter keeps a minimum wait). https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
- Agones: policies "include" Buffer, Webhook, Counter and List; reference lists seven (also Schedule, Chain, Wasm). https://agones.dev/site/docs/reference/fleetautoscaler/
- RLIMIT_NOFILE bounded by nr_open and EMFILE: moved to its own FACTS row sourced to getrlimit(2). https://man7.org/linux/man-pages/man2/getrlimit.2.html
- Godot default 60 physics ticks per second: now verified, own FACTS row. https://docs.godotengine.org/en/stable/classes/class_projectsettings.html
- Unity -batchmode / -nographics: source changed to the Unity 6 manual. https://docs.unity3d.com/6000.0/Documentation/Manual/PlayerCommandLineArguments.html
- "Full client costs a core or more per bot": softened to "often a large share of a core", labelled a rule of thumb (Riot says only that full clients had too much overhead).
- Mock-tier "10 to 100 times": dropped, now "far beyond" (Riot gives 500 games per core, no ratio).
- Generator "below about 70 per cent CPU": labelled a rule of thumb. No source.
- Players per core: now "measured at the target room size" (per-player cost rises with room size; reasoning, no source).
- Cost per CCU worked example (0.40 dollars an hour, 800 players, 0.0005 dollars per concurrent user per hour): illustrative arithmetic, labelled as such.
- New how items: ephemeral-port ceiling 60999 - 32768 + 1 = 28,232 (arithmetic from the kernel default range), somaxconn 4096 since 5.4, EMFILE and nr_open (kernel ip-sysctl page and getrlimit(2) above); GC pause charting with GOGC=100 and GOMEMLIMIT thrashing, https://tip.golang.org/doc/gc-guide.
- Locust: added a line and FACTS row. Users run in gevent green threads; constant_throughput paces each user ("at most X times per second"); poisson gives arrival-like intervals; wait time cannot launch more users. Read raw this session (curl) at https://docs.locust.io/en/stable/writing-a-locustfile.html. The "closed-loop by default" wording is my inference from the per-user model, not a quoted statement.
- "Thundering herd": named once in the stampede step (term only, no claim).
- Interview mid[0] follow-up reworded to ask how fast the queue grows (10 s holds, pool 200 serves 20/s, queue grows about 30/s: arithmetic).
- Interview junior[1]: titled "ramp-and-hold".
- Code: Unity snippet now seeds System.Random per bot from GetInstanceID() in Awake; the thread-safety pitfall now says concurrent use corrupts state and can return zeros (Microsoft documents Random as not thread-safe; reported by the fact-checker, not re-opened). Unity's Mono seeding behaviour for the parameterless constructor remains unverified, which is why the snippet seeds explicitly. Go snippet gained a 1,000-slot semaphore to match its pitfall (not compiled; Go not installed). Godot snippet comment notes `sent` grows under loss.
- Self-check: PLAYABLE_DRAFTS with this draft and the three server siblings ends `OK: all cross-links resolve, all topics complete.` Engine snippets: Godot 15 lines / 702 chars, Unity 14 lines / 684 chars.
