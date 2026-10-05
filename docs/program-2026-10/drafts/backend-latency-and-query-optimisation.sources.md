# Sources: backend-latency-and-query-optimisation

"Read" = fetched through a page-fetch tool that returns an extracted summary. "Read (raw text)" = the PDF text was extracted locally and read. "Not read" = from memory or inference.

## Claims from sources

- Tail at Scale, 63%: 100 servers in parallel, each with 1 s 99th percentile, so 63% of requests take over one second; also one in 10,000 at 100 servers example. https://www.barroso.org/publications/TheTailAtScale.pdf (Read, raw text via pdftotext).
- Tail at Scale, fan-out table: 99th percentile of a single request 10 ms, for all to finish 140 ms, 99th percentile for 95% finishing 70 ms. Same source (Read, raw text).
- Tail at Scale, hedged requests: send after the 95th-percentile expected latency; adds about 5% load; BigTable benchmark, 1,000 keys over 100 servers, 10 ms hedge delay, 99.9th percentile 1,800 ms to 74 ms with just 2% more requests; hedges can be tagged lower priority; hedging helps only when the cause does not hit all replicas at once. Same source (Read, raw text).
- Tail at Scale, tied requests: cancel message to counterpart on start; one average network delay window; median -16% and nearly 40% at 99.9th percentile in the file-system test; under 1% disk overhead. Same source (Read, raw text). Used only in a TECH row at summary level.
- Tail at Scale, other techniques named (micro-partitions, good-enough, canary requests, latency-induced probation): named in the paper, only mentioned in passing. Same source (Read, raw text).
- "Within 100 milliseconds feels fluid": the paper's opening sentence, also on the abstract page. https://research.google/pubs/the-tail-at-scale/ (Read, extracted).
- Google SRE book, Handling Overload: per-request retry up to three attempts; per-client retry ratio under 10% (about 1.1x instead of 3x); adaptive throttling with K = 2; four criticality classes (CRITICAL_PLUS, CRITICAL, SHEDDABLE_PLUS, SHEDDABLE). https://sre.google/sre-book/handling-overload/ (Read, extracted).
- Google SRE book, Cascading Failures: queue length around 50% or less of the thread pool; load shedding with 503; deadline propagation with elapsed time subtracted; randomised exponential backoff; retry budget (the extraction gave "60 retries/minute" as an example; NOT used in the topic). https://sre.google/sre-book/addressing-cascading-failures/ (Read, extracted).
- PostgreSQL EXPLAIN: ANALYZE executes the query (wrap writes in a transaction and roll back); costs in page-fetch units with seq_page_cost 1.0 and cpu_tuple_cost 0.01; estimates from ANALYZE statistics; timing overhead. https://www.postgresql.org/docs/current/using-explain.html (Read, extracted).
- PostgreSQL index-only scans: B-tree supports them; needs visibility map; INCLUDE for payload columns; a win only when a significant fraction of heap pages are all-visible. https://www.postgresql.org/docs/current/indexes-index-only-scans.html (Read, extracted). The "PostgreSQL 11 and later" for INCLUDE in the TECH row is from memory (Not read: release notes).
- PostgreSQL LIMIT/OFFSET: skipped rows still computed; ORDER BY needed for stable results. https://www.postgresql.org/docs/current/queries-limit.html (Read, extracted).
- PostgreSQL resource defaults: shared_buffers 128MB, work_mem 4MB per operation. https://www.postgresql.org/docs/current/runtime-config-resource.html (Read, extracted).
- pg_stat_statements: calls, total_exec_time, mean_exec_time, blocks hit and read, normalisation, shared_preload_libraries and restart. https://www.postgresql.org/docs/current/pgstatstatements.html (Read, extracted).
- MySQL EXPLAIN output: type ladder from const to ALL, key, rows, filtered, Extra "Using index" (covering), "Using filesort", "Using temporary". https://dev.mysql.com/doc/refman/8.4/en/explain-output.html (Read, extracted).
- Use The Index, Luke, keyset ("seek") paging: why OFFSET reads and discards rows, drift on insert, no jump to page N. https://use-the-index-luke.com/no-offset (Read, extracted). The row-value comparison with mixed ASC/DESC not indexing cleanly in PostgreSQL is from memory (Not read; the topic says "check the plan").
- HikariCP pool sizing: formula connections = (core_count x 2) + effective_spindle_count attributed to the PostgreSQL project; Oracle Real-World Performance demo cut pool from 2048 to 96 and response time from about 100 ms to about 2 ms; SSDs mean fewer connections are better. https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing (Read, extracted; a secondary source for the formula, which the page attributes to PostgreSQL; the PostgreSQL mailing-list original was not read). The topic says "rule of thumb", not a PostgreSQL requirement.
- PgBouncer pooling modes and what breaks in transaction mode (session state, cursors WITH HOLD, PREPARE, LISTEN, session advisory locks, temp tables). https://www.pgbouncer.org/features.html (Read, extracted).
- Go database/sql: default unlimited open connections, default 2 idle, SetConnMaxLifetime and SetConnMaxIdleTime, DBStats WaitCount and WaitDuration, context cancellation depends on driver support. https://pkg.go.dev/database/sql#DB.SetMaxOpenConns (Read, extracted).
- Go context: WithTimeout, WithDeadline, cancel must be called, ctx as first parameter, do not store in structs. https://pkg.go.dev/context (Read, extracted).
- Go runtime/pprof predefined profiles (goroutine, heap, allocs, threadcreate, block, mutex); block and mutex profiling are enabled by SetBlockProfileRate and SetMutexProfileFraction. https://pkg.go.dev/runtime/pprof (Read, extracted).
- Go pprof blog: net/http/pprof import, go tool pprof against a live server's /debug/pprof/profile, CPU profile about 100 samples per second. https://go.dev/blog/pprof (Read, extracted; the blog is old). The "30 seconds" profile duration in the TECH row is the default of the endpoint from memory (Not read).
- Go GC guide: GOGC default 100, doubling halves GC CPU and doubles heap overhead; GOMEMLIMIT soft limit; cutting allocations is the largest lever. https://tip.golang.org/doc/gc-guide (Read, extracted). Not used in the main text beyond the FACTS row.
- singleflight: Group.Do, DoChan, shared flag, Forget. https://pkg.go.dev/golang.org/x/sync/singleflight (Read, extracted).
- Brendan Gregg, flame graphs: x axis is alphabetical, not time; width is frequency; y axis is stack depth; invented while investigating a MySQL problem; "The Flame Graph", CACM 59(6), 2016. https://www.brendangregg.com/flamegraphs.html (Read, extracted).
- Exponential backoff and jitter: full jitter sleep = random(0, min(cap, base x 2^attempt)); equal and decorrelated variants; jitter more than halved calls with 100 contending clients. https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/ (Read, extracted).
- Little's law L = lambda W; holds for stationary systems regardless of arrival or service distribution; Little 1961, Operations Research. https://en.wikipedia.org/wiki/Little%27s_law (Read, extracted; secondary. The primary paper was not read).
- Godot HTTPRequest.timeout default 0.0 means never; request() returns an Error; request_completed(result, response_code, headers, body). https://docs.godotengine.org/en/stable/classes/class_httprequest.html (Read, extracted).
- Unity UnityWebRequest.timeout: int seconds, 0 means no timeout. https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Networking.UnityWebRequest-timeout.html (Read, extracted).

## Not read, from memory or inference

- AWS Builders' Library "Timeouts, retries and backoff with jitter": the page redirected and the extractor returned nothing. The claim "set the timeout from a high percentile (p99.9) of the call's latency" and "retries multiply across layers" are practitioner guidance and match the SRE book's retry text; the p99.9 figure is a rule of thumb stated in the topic as "a little above p99.9", not a sourced value. https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/ (Not read).
- Coordinated omission (the load generator waits for each reply and so under-counts stalls): Gil Tene's talk "How NOT to Measure Latency". https://www.youtube.com/watch?v=lJ8ydIuPFeU (Not read; from memory). Used only as a named trap.
- "Percentiles cannot be averaged; merge histograms": standard monitoring practice (Prometheus histogram_quantile docs, HdrHistogram). https://prometheus.io/docs/practices/histograms/ (Not read).
- "Starting values" in the TECH rows: Postgres EXPLAIN reading order, 30 ms hedge delay in the Go snippet, 3 s client timeout, 8 s cap, chunk size of "a few hundred to a few thousand ids": practitioner heuristics, labelled as placeholders or starting points in the text.

## Illustrative arithmetic (not sourced)

- 1 - 0.99^100 = 63.4% (matches the paper); 1 - 0.99^40 = 33.1% (the senior question); 1 - 0.99^10 = 9.6%.
- Retry amplification: 3 layers x 3 attempts = 27 attempts at the bottom (3^3).
- Little's law: 2,000 requests/s x 0.05 s = 100 in flight.
- OFFSET 100,000 LIMIT 20 reads about 100,020 rows (page 5,000 at 20 per page, counted from 0, is offset 99,980; the text says "walks 100,000 rows", rounded).
- M/M/1 queue: time in system = service time / (1 - utilisation): 2x at 50%, 5x at 80%, 10x at 90%, 50x at 98%. Textbook formula; no source fetched.
- Diagram y values: 1/(1-u)/50 at u = 0, 0.5, 0.8, 0.9, 0.98 gives 0.02, 0.04, 0.1, 0.2, 1.0; the x axis is u/0.98.

## Verification limits

- Go snippet not compiled (Go is not installed); reviewed by reading. Checks done by reading: all five imports used; buffered result channel of size 2 so a late loser's send never blocks; b is cleared after the second launch so the hedge starts at most once; the timer is stopped on return; the 250 ms request deadline cancels the shared context through the parent.
- Godot and Unity snippets were not run. GDScript recursion with await and the Task.Yield loop in Unity are ordinary patterns, but not executed here.
- Validator: passes with sibling drafts loaded; the Go tab is reported as LONG (91 lines, 2,123 characters), which is a guide, not an error.

## Fact-check changes (2026-10-05)

Applied from `backend-latency-and-query-optimisation.factcheck.md`.

- TECH "Retry budget and full jitter": "nine tries" corrected to 27 attempts (3 x 3 x 3), and the interview follow-up now says "three attempts per layer", so the trap, explainer frame 4, TECH row and follow-up agree. Source: SRE book, attempts multiply across layers ("the product of the number of attempts at each layer"). https://sre.google/sre-book/addressing-cascading-failures/ (read by the fact-checker on the raw page).
- TECH "Load shedding by priority": clients throttle once requests reach K times accepts (not rejections), K = 2. https://sre.google/sre-book/handling-overload/ (raw page, fact-checker).
- TECH "Flame graph": order across the page is alphabetical in Gregg's tool, by decreasing cost in pprof's own view (golang/go release-branch.go1.23, `src/cmd/vendor/github.com/google/pprof/internal/driver/html/stacks.js`, "Order by decreasing cost", per the fact-check). Never time. https://www.brendangregg.com/flamegraphs.html (raw page).
- FACTS row 3: "service-wide" changed to "server-wide retry budget (per process)", as the SRE book words it. https://sre.google/sre-book/addressing-cascading-failures/
- TECH "Small, measured connection pool", FACTS row 9: PgBouncer transaction mode still breaks session advisory locks, LISTEN and SQL-level PREPARE, but protocol-level prepared statements work through `max_prepared_statements` (default 200 in current docs). https://www.pgbouncer.org/features.html ; https://www.pgbouncer.org/config.html (raw pages, fact-checker). Version-dependent, so the text says to check the version.
- Unity snippet: `Random.Range` is now `UnityEngine.Random.Range` (avoids the System.Random ambiguity, CS0104); the loop checks the token, calls `UnityWebRequest.Abort()` and `ThrowIfCancellationRequested()`, so a cancelled call stops and throws OperationCanceledException. `Abort()` added to api[]. Snippet is 15 lines, 816 characters. Not compiled or run. API: https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Networking.UnityWebRequest.Abort.html (from memory of the reference; not re-read here).
- Godot pitfall: added that the snippet retries every non-200 including 4xx, which should not be retried (matches the Unity pitfall). No new claim.
- Go pitfall: "doubles the load" softened to "comes close to doubling" (a 30 ms delay on a 40 ms median hedges more than half of calls). Own reasoning.
- DIAGRAM alt: now "rises slowly at first, doubles at 50 per cent", fixing the self-contradiction. Arithmetic unchanged (1/(1-u)).
- FACTS rows 4 and 5: src now lists the pages that carry each fact (queries-limit, indexes-index-only-scans, sql-createindex, pgstatstatements) alongside the original. https://www.postgresql.org/docs/current/queries-limit.html ; https://www.postgresql.org/docs/current/indexes-index-only-scans.html ; https://www.postgresql.org/docs/current/sql-createindex.html ; https://www.postgresql.org/docs/current/pgstatstatements.html
- Thin coverage added, as one new `how` step each: (a) GC and allocation: allocation profile, GC trace, GOGC and GOMEMLIMIT trade, sourced to the Go GC guide https://tip.golang.org/doc/gc-guide (GOGC 100, doubling halves GC CPU, GOMEMLIMIT since Go 1.19; raw page, fact-checker). `GODEBUG=gctrace=1` is stated from the Go runtime documentation, not re-read here. Buffer reuse is practitioner advice. (b) Chatty services and serialisation: aggregate calls behind one endpoint (rests on the fan-out arithmetic in the Tail at Scale paper, https://www.barroso.org/publications/TheTailAtScale.pdf); the encoding tips (fewer fields, encode once, binary format) are practitioner advice, labelled as measure-before-and-after, not sourced numbers.

Set aside by the fact-checker and left unchanged: work_mem wording, "100,000 rows" rounding, EXPLAIN BUFFERS in PostgreSQL 18, tied-request detail, Little's law caveat, mixed ASC/DESC row-value note, coordinated omission and percentile merging, `w.Write` result ignored, Go tab length (LONG warning).

Re-check: validator with this draft plus its two linked siblings loaded reports no error for this draft; remaining errors are the siblings' own `rel` links to unintegrated drafts. Go snippet unchanged and still not compiled.
