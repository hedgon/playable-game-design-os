# Fact-check: backend-latency-and-query-optimisation

Checked 2026-10-05 against `drafts/backend-latency-and-query-optimisation.js`, its `.sources.md`, the `topics.md` brief section and the raw primary pages (curl and pdftotext, not page summaries).

## Verdict: PASS WITH FIXES

Counts: WRONG 4, UNSUPPORTED 0, OUTDATED 1. There are also 2 code issues: the Unity snippet does not compile as described, and its cancellation does not do what the text promises. The numbers from the Tail at Scale paper, the SRE book, PostgreSQL, Go, Godot and Unity hold up on the raw pages. The errors are in four TECH rows, one FACTS row and the Unity snippet.

Most serious: the TECH row "Retry budget and full jitter" says three layers of three tries make **nine** attempts at the bottom. The SRE book says attempts multiply across layers, so it is **27**. The draft's own trap, interview answer and explainer frame 4 also say 27, so the draft contradicts itself on the exact number it teaches.

## Claims

| Claim (short) | Location | Verdict | Correct value | Source |
|---|---|---|---|---|
| "three layers of three tries make nine tries per call at the bottom" | TECH "Retry budget and full jitter", cost | WRONG | 3 x 3 x 3 = 27 attempts. The book says attempts can reach "the product of the number of attempts at each layer". Nine only holds with two retrying layers. | https://sre.google/sre-book/addressing-cascading-failures/ |
| "throttle themselves once rejections pass K times accepted requests, with K at 2" | TECH "Load shedding by priority", how | WRONG | Clients self-regulate once **requests** reach K times **accepts**, not rejections. K = 2 is correct ("We generally prefer the 2x multiplier"). The FACTS row has the right wording. | https://sre.google/sre-book/handling-overload/ |
| "go tool pprof and its flame graph view ... the order across the page is alphabetical" | TECH "Flame graph from a CPU profile", how | WRONG (for Go) | Gregg's flame graphs sort alphabetically, but pprof's flame graph, including the copy shipped with Go 1.23, orders by decreasing cost. The source comment reads "Order by decreasing cost". Say "alphabetical in Gregg's tool, by size in pprof; never time". | https://www.brendangregg.com/flamegraphs.html ; golang/go release-branch.go1.23 `src/cmd/vendor/github.com/google/pprof/internal/driver/html/stacks.js` line 365 |
| "a service-wide retry budget" | FACTS row 3 | WRONG (minor) | The book says a **server-wide** budget, per process ("only allow 60 retries per minute in a process"). | https://sre.google/sre-book/addressing-cascading-failures/ |
| "a transaction-mode pooler breaks ... server-side prepared statements" | TECH "Small, measured connection pool", cost | OUTDATED | PgBouncer now supports protocol-level prepared statements in transaction mode through `max_prepared_statements`, which defaults to 200 in the current docs. Only SQL-level PREPARE/DEALLOCATE is still "Never". Suggested fix: "SQL PREPARE (protocol-level prepared statements need max_prepared_statements, on by default in recent versions)". | https://www.pgbouncer.org/features.html ; https://www.pgbouncer.org/config.html |
| 100 servers, 1 s p99 each, so 63% of requests slower than 1 s; servers "typically respond in 10 ms" | tag, why[0], FACTS 1, interview junior 1 | CONFIRMED | 1 - 0.99^100 = 0.634 | Tail at Scale PDF (raw text) |
| CACM, February 2013 | FACTS 1 | CONFIRMED | vol. 56, no. 2 | same PDF, page footers |
| Hedge after 10 ms: 99.9th percentile 1,800 ms to 74 ms with 2% more requests, 1,000 keys over 100 servers | FACTS 1, think.trade, Go pitfall | CONFIRMED | | same |
| Waiting for the p95 limits extra load to about 5% | FACTS 1, TECH hedged | CONFIRMED | | same |
| Tied requests: each copy carries the other server's identity and cancels its counterpart when it starts | TECH hedged | CONFIRMED (summary level) | | same |
| "within 100 ms feels fluid" (the paper's opening) | how[1] | CONFIRMED | | same |
| Per-request retry up to three attempts; per-client retry ratio under 10% | how[9], TECH retry, FACTS 2, interview mid 3 | CONFIRMED | | SRE Handling Overload |
| Adaptive throttling, requests > K x accepts, K = 2 | FACTS 2 | CONFIRMED | | same |
| Queue length 50% or less of the thread pool; deadline propagation; randomised exponential backoff | FACTS 3, how[10] | CONFIRMED | | SRE Cascading Failures |
| EXPLAIN ANALYZE executes the statement | FACTS 4, interview junior 3 | CONFIRMED (writer read the page) | | PostgreSQL using-explain |
| Rows skipped by OFFSET are still computed | FACTS 4 | CONFIRMED | | PostgreSQL queries-limit (raw) |
| Index-only scan wins only if "a significant fraction" of heap pages are all-visible | FACTS 4, TECH covering | CONFIRMED | | PostgreSQL indexes-index-only-scans (raw) |
| INCLUDE in PostgreSQL 11 and later (writer: from memory) | TECH covering | CONFIRMED | CREATE INDEX docs for v11 have INCLUDE; v10 does not | postgresql.org/docs/11 and /10 sql-createindex |
| shared_buffers 128 MB; work_mem 4 MB; total can be many times work_mem | FACTS 5 | CONFIRMED | | PostgreSQL runtime-config-resource (raw) |
| pg_stat_statements needs shared_preload_libraries and a restart | TECH statement statistics, FACTS 5 | CONFIRMED (writer read the page) | FACTS 5 cites the wrong page for it (see Teaching issues) | PostgreSQL pgstatstatements |
| 3 ms x 5,000/s beats a 2 s daily report | TECH statement statistics | CONFIRMED (arithmetic) | 15 s per second against 2 s per day | own arithmetic |
| database/sql: MaxOpenConns default 0 (unlimited), idle default 2; DBStats WaitCount and WaitDuration | FACTS 6, how[7] | CONFIRMED | `defaultMaxIdleConns = 2`; "The default is 0 (unlimited)" | Go 1.23 `src/database/sql/sql.go` |
| CPU profile for 30 s (writer: from memory) | TECH flame graph | CONFIRMED | `sec = 30` when seconds is absent | Go 1.23 `src/net/http/pprof/pprof.go` line 148 |
| GOGC 100; doubling it doubles heap overhead and roughly halves GC CPU; GOMEMLIMIT from Go 1.19 | FACTS 7 | CONFIRMED | | tip.golang.org/doc/gc-guide (raw) |
| Godot HTTPRequest.timeout defaults to 0.0, which never times out | FACTS 8, engine godot | CONFIRMED | | Godot class_httprequest (raw) |
| Unity UnityWebRequest.timeout is an int, default 0 means no timeout | FACTS 8, engine unity | CONFIRMED | | Unity 6000.0 ScriptReference (raw) |
| PgBouncer transaction mode breaks session advisory locks, LISTEN, PREPARE | FACTS 9 | CONFIRMED | The features table marks all three "Never" | pgbouncer.org/features.html (raw) |
| Pool rule of thumb: 2 x cores + disks, derived from PostgreSQL | how[7], TECH pool | CONFIRMED (secondary, as the writer says) | `((core_count * 2) + effective_spindle_count)` | HikariCP wiki About-Pool-Sizing (raw) |
| Timeout from the call's p99.9 (writer: not read) | how[9], interview mid 3 | CONFIRMED | AWS takes the latency percentile matching an acceptable false-timeout rate, "p99.9 in this example" | aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter (raw) |
| Flame graph x axis alphabetical, width is frequency, look at the top edge | TECH flame graph | CONFIRMED for Gregg's tool | | brendangregg.com/flamegraphs.html (raw) |
| 1 - 0.99^40 = about 33% | interview senior 1 | CONFIRMED | 0.331 | own arithmetic |
| Little's law: 2,000/s x 0.05 s = 100 in flight | interview mid 4 | CONFIRMED | | own arithmetic; textbook |
| M/M/1: 2x at 50%, 5x at 80%, 10x at 90%, 50x at 98% | DIAGRAM | CONFIRMED | 1/(1-u) | own arithmetic |
| Diagram points (0,0.02),(0.51,0.04),(0.82,0.1),(0.92,0.2),(1,1) | DIAGRAM | CONFIRMED | u/0.98 = 0.510, 0.816, 0.918, 1; values/50 match | own arithmetic |
| OFFSET page 5,000 at 20 per page walks 100,000 rows | interview mid 1 | CONFIRMED | offset 99,980 + 20 rows read | own arithmetic |
| Full jitter: random(0, min(cap, base x 2^attempt)) | TECH retry, engine snippets | CONFIRMED (writer read the page; the sibling draft cites it too) | The snippets use base 2 s and cap 8 s, which is consistent | AWS Architecture blog |

## Code issues

1. **Unity snippet does not compile with the usings the pitfall lists.** The pitfall lists both `System` and `UnityEngine`, so the bare `Random.Range(...)` is ambiguous between `UnityEngine.Random` and `System.Random` (error CS0104). The api list says `UnityEngine.Random.Range()`, but the code does not. Fix: write `UnityEngine.Random.Range` in the code. Every other Unity API was confirmed on the 6000.0 reference: `UnityWebRequest.Get(string)`, `timeout` (int), `SendWebRequest()` returning an `UnityWebRequestAsyncOperation` with `isDone`, `Result.Success`, and `Random.Range(float, float)`. `Task.Yield`, `Task.Delay(TimeSpan, CancellationToken)` and `Mathf.Min`/`Mathf.Pow` are standard. Not compiled or run.
2. **The Unity snippet does not honour the CancellationToken during the request.** The `term` text says the token makes "a closed screen stop its call". But the `while (!op.isDone) await Task.Yield();` loop never checks `ct` and never calls `req.Abort()`, so the request runs to completion. A cancelled call then throws `new Exception(req.error)` rather than `OperationCanceledException`. Fix: check `ct.IsCancellationRequested` in the loop, call `req.Abort()` and `ct.ThrowIfCancellationRequested()`.
3. **Godot snippet:** every API was confirmed on the stable reference: `HTTPRequest.timeout` (float), `request(url, ...) -> Error`, `request_completed(result, response_code, headers, body)`, `RESULT_SUCCESS = 0`, `SceneTree.create_timer(time_sec, ...)`, `JSON.parse_string(String) -> Variant`, `randf()`, `minf(a, b)`, `pow(base, exp)`. Awaiting a signal with several arguments returns an Array in Godot 4, so `r[0]..r[3]` is right. Not run. Teaching note: the snippet retries every non-200, including 4xx. The Unity pitfall says that is wrong, but the Godot pitfall does not.
4. **Go snippet:** not compiled (Go is not installed); read line by line against Go 1.23 and found nothing that would fail to compile. All five imports are used (`context`, `errors`, `io`, `net/http`, `time`). `ctx, cancel := context.WithCancel(ctx)` re-uses the parameter legally because `cancel` is new. `result{body, err}` is a valid positional literal. `httpGet` matches the `get` parameter type. `return io.ReadAll(resp.Body)` returns the right pair. `w.Write(body)` drops its results, which compiles but would be flagged by errcheck. Behaviour: the channel buffer of 2 prevents a goroutine leak, and the hedge starts at most once. On a deadline, either `ctx.Err()` or a `*url.Error` wrapping `context.DeadlineExceeded` comes back. `errors.Is` unwraps both, so the 504 branch works in both cases.

## Teaching issues

- The retry multiplication appears four times with three different answers: 27 (trap, explainer frame 4), 9 (TECH retry) and an ambiguous follow-up ("each retry three times" would be 4 attempts each, so 64). Make them all say "three attempts per layer, 27".
- The DIAGRAM `alt` says time in system "stays near the idle value until about half of capacity is used, doubles at 50 per cent". That contradicts itself: it is already double at 50%. Say "rises slowly, to double at 50 per cent".
- FACTS 4 cites only `using-explain.html`, but the OFFSET, index-only-scan and INCLUDE facts are on `queries-limit`, `indexes-index-only-scans` and `sql-createindex`. FACTS 5 cites `runtime-config-resource` for the pg_stat_statements facts. The claims are true, but list the pages that carry them.
- Go pitfall: "a 30 ms delay on a call whose median is 40 ms ... doubles the load". It hedges more than half the calls, so the extra load is somewhat over 50%, approaching double. Acceptable as rough, but "close to doubles" would be honest.

## Missing or thin coverage (brief "Must cover")

All items are present. Thin ones:
- serialisation: only "JSON encoding" in the flame-graph `fit`;
- chatty services: only "aggregate behind one endpoint" in senior answer 1;
- GC: named as a cause and in FACTS 7, but there is no step on reading GC pauses or cutting allocations.

Caching is linked to backend-caching-redis and not repeated, as the brief asks.

## Validation and siblings

- `node src/validate.js` with PLAYABLE_DRAFTS set to all 15 drafts: exit 0. This draft gets only WARN "no inbound links", "not in any learning path" and LONG (Go snippet 91 lines, 2,123 chars).
- With only this draft plus its two linked sibling drafts (server-load-testing-and-capacity, realtime-connection-tier-at-scale): exit 1. The errors come only from the siblings' own `rel` pointing at other unintegrated drafts, not from this draft.
- Repetition: server-load-testing-and-capacity also covers coordinated omission, full jitter and retry budgets, and cites the AWS jitter study and k6. This draft only names coordinated omission as a trap and states the jitter formula in one TECH row, and its rel points there. The overlap is small and acceptable. Nothing is copied from realtime-connection-tier-at-scale beyond the full-jitter phrase.

## Style

No US spellings (`ANALYZE` is the SQL keyword), no hype words, and no employer, colleague or internal project names found by grep.

## Set aside

- work_mem "4 MB per sort or hash operation": hash operations may use work_mem x hash_mem_multiplier (default 2.0). A fair simplification at this level; not flagged.
- Trap "Page 5,000 reads and throws away 100,000 rows": strictly it throws away 99,980. A rounding the writer disclosed; not flagged.
- `EXPLAIN (ANALYZE, BUFFERS)`: PostgreSQL 18 shows buffers by default with ANALYZE. The explicit option is still valid and works on older versions; not flagged.
- Tied-request detail (the paper suggests a short delay before the second copy): the TECH row is at summary level and not wrong.
- Little's law "without assumptions about the arrival pattern": true for a stable (stationary) system. The interview red flag about peaks covers the caveat.
- Mixed ASC/DESC row-value comparison not indexing cleanly (writer: from memory): stated as "check the plan", which is safe; no source fetched.
- Coordinated omission and "percentiles cannot be averaged" (writer: not read): standard concepts, both stated as practice, and the sibling draft sources the first; not flagged.
- `w.Write` result ignored in the Go snippet: compiles and is common in examples; not flagged.
- The Go tab's LONG warning: a guide, not an error; trimming is the integrator's call.
- I never ran git. Downloads intended for the scratchpad briefly landed in the repo root through a shell backgrounding slip. All 15 files were moved to the scratchpad, and the repo root lists only its original files.
