# Fact-check: web-performance-basics

Checked 2026-10-05 against the raw primary pages, fetched with curl. Draft not edited.

## Verdict: PASS WITH FIXES

Counts: WRONG 5, UNSUPPORTED 4, OUTDATED 0.

The most serious issue is that "Meta 2 MB for a single HTML file" is wrong. Meta's own help page (business/help/412951382532338, fetched in en_US and vi_VN) says a single HTML5 playable may be up to 5 MB, and a ZIP may be up to 5 MB with at most 100 files. The 2 MB figure comes from the secondary vendor blog. It appears in six places (`what`, `why`, TECH "Inline single-file build" cost, the senior interview answer, `facts[6]`, and indirectly the "tightest cap" advice), and the senior interview treats it as the cap to build to. The sibling topic `soft-launch-and-playable-ads` already states the correct 5 MB, so the two pages contradict each other.

## Validation

- `PLAYABLE_DRAFTS=docs/program-2026-10/drafts/web-performance-basics.js node src/validate.js` gives one error: `rel -> unknown craft-memory-loading-and-streaming`.
- Running it again with the sibling draft also loaded (`...web-performance-basics.js,...craft-memory-loading-and-streaming.js`) gives no errors for this topic. The only errors left belong to the sibling's own rel targets (craft-gpu-rendering-cost, craft-mobile-gpu-and-thermals, craft-cpu-cache-and-data-layout). The warnings are "no inbound links" and "not in any learning path", which is expected for a draft.
- The other rel targets (infra-cdn-assets, soft-launch-and-playable-ads, craft-performance) exist in `content/topic/`.

## Claims

| Claim (short) | Field | Verdict | Correct value / note | Source |
|---|---|---|---|---|
| LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 at p75, mobile/desktop segmented | what, facts[0], interview | CONFIRMED | | https://web.dev/articles/vitals |
| INP replaced FID as a stable vital in 2024 | what, facts[0] | CONFIRMED | "INP became a stable Core Web Vital metric in 2024" | web.dev/articles/vitals |
| INP 200 / 500 ms bands | facts[1] | CONFIRMED | | https://web.dev/articles/inp |
| LCP poor above 4.0 s | facts[1] | CONFIRMED | stated in the figure alt text on the LCP page | https://web.dev/articles/lcp |
| CLS poor above 0.25; session window 1 s gap, 5 s max | facts[1] | CONFIRMED | | https://web.dev/articles/cls |
| LCP split ~40 / <10 / ~40 / <10 percent | how, interview, explainer | CONFIRMED | the page calls these guidelines | https://web.dev/articles/optimize-lcp |
| Long task over 50 ms; scheduler.yield() with a setTimeout fallback; yield about every 50 ms | how, facts[2], TECH | CONFIRMED | | https://web.dev/articles/optimize-long-tasks |
| Lighthouse 10 weights TBT 30, LCP 25, CLS 25, FCP 10, SI 10 | facts[3] | CONFIRMED | | developer.chrome.com performance-scoring |
| CrUX field data over 28 days | (sources list) | CONFIRMED | | web.dev/articles/lab-and-field-data-differences |
| "One 400 ms handler matters more than a hundred fast ones" | think.traps | WRONG | INP ignores the highest interaction for every 50 interactions. With 101 interactions the two highest are dropped, so this exact 400 ms outlier would not be reported. Reword as "INP reports the worst interaction (near-worst on pages with 50+ interactions), not the average" | web.dev/articles/inp |
| Cache-Control: public, max-age=31536000, immutable for versioned files; no-cache + ETag for HTML | facts[9], how, TECH, interview | CONFIRMED | | MDN HTTP caching guide |
| Old service worker stays until pages close; skipWaiting | TECH, interview | CONFIRMED | | MDN Using Service Workers |
| Brotli 14 / 21 / 17 percent smaller (JS / HTML / CSS), CertSimple | TECH | CONFIRMED | order matches | https://web.dev/articles/codelab-text-compression-brotli |
| 225 KB bundle to 53.1 KB (Brotli) vs 61.6 KB (gzip) | TECH | CONFIRMED | arithmetic: (61.6-53.1)/61.6 = 13.8 percent, consistent with "14" | same |
| V8: median phone 3-4x, low-end over 6x; bundles 50-100 kB | why, facts[10] | CONFIRMED (with nuance) | The measurement is of Reddit's JavaScript (Moto G4 vs Pixel 3, Alcatel 1X). V8 says to split a bundle that exceeds ~50-100 kB. The draft's 2019 caveat is good. | https://v8.dev/blog/cost-of-javascript-2019 |
| Meta 2 MB single HTML (5 MB ZIP) | what, why, TECH cost, interview senior, facts[6] | WRONG | Meta's help page: single HTML5 file "Maximum file size: 5MB"; ZIP total up to 5 MB, no more than 100 files. So no network in the set is at 2 MB, and "Meta's 2 MB single-file cap is the tightest" goes too. | https://www.facebook.com/business/help/412951382532338 (also cited by sibling soft-launch-and-playable-ads) |
| AppLovin: single HTML, <= 5 MB, embedded resources, no external calls | why, facts[4] | CONFIRMED | The page also requires MRAID 2.0 and base64/base122 embedding. The cited URL redirects to .../welcome-to-applovin/creative-specs-and-guidelines. | support.applovin.com |
| Unity Ads: one inlined minified index.html under 5 MB, MRAID 3.0, no XHR except permitted analytics | why, facts[4], facts[5] | CONFIRMED | the claim list marked this S; now read on the raw page | https://docs.unity.com/en-us/user-acquisition/creatives/creative-specifications |
| Google Ads 5 MB | facts[6], TECH alt | CONFIRMED | ZIP only (max 5 MB, 512 files), so Google requires a ZIP, it does not just "allow" one | https://support.google.com/google-ads/answer/9981650 |
| Mintegral 5 MB | why, facts[6] | UNSUPPORTED | Only the secondary blog. The guessed Mintegral spec URL returned 404; no primary page was found. | segwise.ai (secondary) |
| TikTok, Liftoff 5 MB; Moloco under 5 MB | facts[6] | UNSUPPORTED | Only the secondary blog. The draft labels it secondary. That blog is wrong on Meta, so it should not be relied on. | segwise.ai (secondary) |
| "Inlining everything into one HTML file is required by most playable ad networks" | think.trade | UNSUPPORTED | Of the four networks checked on primary pages, two require one HTML file (AppLovin, Unity Ads), Meta allows HTML or ZIP, and Google requires a ZIP. Say "AppLovin and Unity Ads require..." | primary pages above |
| Godot .wasm to about a quarter with gzip; Brotli precompression; single-thread default since 4.3; COOP/COEP for threads; WebGL 2.0 only | ENGINE godot, facts[7] | CONFIRMED | | docs.godotengine.org exporting_for_web |
| Unity Web: gzip default, Brotli, Disabled; matching Content-Encoding; application/wasm for streaming; Decompression Fallback means a larger loader | ENGINE unity, facts[8] | CONFIRMED | | docs.unity3d.com/6000.0 webgl-deploying |
| "Brotli in the browser needs HTTPS" | ENGINE unity pitfall | CONFIRMED | Unity: "Chrome and Firefox only natively support Brotli compression over HTTPS". The codelab says the same. | as above |
| Base64 adds about a third | TECH, interview | CONFIRMED (arithmetic) | 4 output bytes per 3 input = +33.3 percent | C |
| Site case: 8.7 MB file (2.8 MB gzipped) to "a 292 KB page" | why | WRONG (units) | The 292 KB is gzipped. research/split-architecture.md: 8,734,466 B raw / 2,844,545 B gzipped before; 2,844 KB to 292 KB gzipped after. The current playable.html is 1,112,724 B raw, 302,947 B gzipped. Say "2.8 MB gzipped to 292 KB gzipped". | docs/program-2026-10/research/split-architecture.md, tasks.md P2.6/P2.7 |
| Diagram note "LCP covers the first four boxes" | DIAGRAM note | WRONG | LCP ends when the element is painted, so it spans the first five boxes (through "Layout and first paint"). Element render delay is part of LCP. | web.dev/articles/optimize-lcp |
| Godot: download a .pck to user:// with HTTPRequest.download_file, then load_resource_pack, in a web export | ENGINE godot snippet | UNSUPPORTED | The APIs exist (below). Whether this works on the web was not checked, and the draft says so. The web user:// is IndexedDB-backed and may not persist (Godot web export doc). | docs.godotengine.org |
| HTTPRequest.get_downloaded_bytes() | ENGINE unity map | CONFIRMED | `int get_downloaded_bytes() const` | Godot class_httprequest |

## Code issues

Godot 4 (read against the stable class reference; not run):
- `HTTPRequest.download_file` (String property): confirmed.
- `request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray)`: the handler signature matches.
- `HTTPRequest.RESULT_SUCCESS = 0`: confirmed.
- `ProjectSettings.load_resource_pack(pack: String, replace_files: bool = true, offset: int = 0) -> bool`: confirmed.
- `SceneTree.change_scene_to_file(path: String) -> Error`: confirmed.
- `OS.has_feature()` is listed in `api` but not used in the snippet. It is real.
- The backslash line continuation inside the `if` is valid GDScript. It becomes a single `\` through the JS template literal.
- The `request()` return value is discarded. This is acceptable for an example.

Unity 6 (read against the 6000.0 ScriptReference; not compiled):
- `UnityWebRequestAssetBundle.GetAssetBundle(string)`, `UnityWebRequest.SendWebRequest() -> UnityWebRequestAsyncOperation`, `UnityWebRequest.result` / `UnityWebRequest.Result.Success`, `DownloadHandlerAssetBundle.GetContent(UnityWebRequest)` and `AssetBundle.LoadAsset<T>(string)`: all confirmed.
- `using var` inside an iterator is legal C# 8+.
- Minor: the bundle is never `Unload`ed. That is fine for a sketch, but worth one word given the topic.

Go: none in the draft.

APIs not confirmed: none. Only the web-export behaviour of the Godot flow is unverified (see table).

## Teaching issues

1. The INP trap: the numbers in it describe a case where INP would drop the outlier (see table).
2. `how` says "keep any single script that runs at start well under a few hundred kilobytes". The draft's own V8 source says to split above ~50-100 kB. Align the two, or explain why the draft uses a looser figure.
3. Unity pitfall: the draft presents Decompression Fallback as the fix. It does not mention that the fallback disables WebAssembly streaming compilation, which the Unity manual states. Only "loader bigger" is given as its cost.
4. The senior interview "build to the tightest cap (Meta's 2 MB)" passes the wrong figure on as a method. The method is sound; the number is not.
5. The case-study comparison mixes a raw size with a gzipped size (see table). That undercuts a topic that tells readers to measure compressed transfer.

## Missing or thin coverage (brief "Must cover")

- WebGPU is not mentioned anywhere. The brief asks for "WebGL/WebGPU game specifics". Add one or two sentences, for example: Godot 4 web is WebGL 2.0 only; Unity 6 has WebGPU as an experimental/opt-in Web graphics API (check this on the Unity manual before writing it).
- The critical rendering path is thin: one `how` step and the diagram. There is no short definition of DOM/CSSOM/render tree and no explanation of why CSS blocks rendering.
- Everything else is covered: Core Web Vitals with thresholds and what moves each; JS cost, long tasks and splitting; caching, hashing and service workers; gzip and Brotli; images; fonts with subsetting; Lighthouse, the DevTools Performance panel, lab vs field and RUM; ad caps; WASM size and streaming.

## Sibling repetition

- `infra-cdn-assets` already teaches content-hashed paths as a technique, with a Godot snippet that fetches a pack to user:// and loads it. This draft's first TECH entry and its Godot snippet partly repeat it. Keep them short and point to the sibling, or change the Godot snippet's angle (for example, progress display or the web-specific CORS/IndexedDB notes).
- `soft-launch-and-playable-ads` already gives per-network playable specs from primary pages (Meta 5 MB HTML or ZIP, Google 5 MB ZIP, AppLovin, Unity). This draft should link to it rather than restate a secondary table, and must not contradict it on Meta.

## Style

No hype words, no US spellings in prose ("optimize" appears only in a URL), and no employer, colleague or internal project names. "this page's author did not run it" in the Godot pitfall is honest, but it reads oddly on a published page. Consider "untested in a web export".

## Set aside

- The V8 figures are from 2019. Not OUTDATED: the draft flags the date and says the ratio is the lesson.
- The Lighthouse weights are labelled "Lighthouse 10". The current page still lists that table, so not outdated.
- "Brotli in the browser needs HTTPS" is broad (Chrome and Firefox per Unity; Brotli is advertised only over HTTPS in practice). Not flagged.
- Godot "single-threaded default since 4.3": the doc says single-thread export became available in 4.3 and is "now default". Close enough, not flagged.
- DevTools flagging tasks over 50 ms is general DevTools behaviour that matches web.dev's definition. Not fetched separately.
- The current gzipped playable.html is 302,947 B, a little above the 292 KB measured at the split. The case study names the split, so not flagged.
- `facts[6]` honestly labels the blog as secondary. That label does not fix its wrong Meta figure, so the figure is flagged above.
- The explainer arithmetic holds: a 300 ms task split into six 50 ms chunks is 300 ms, and TTFB at ~40 percent matches the guidance.
- The Unity snippet uses `op.progress` rather than `req.downloadProgress`. Both work, so not flagged.
- The GitHub Actions log and the map-line request in the user's message are outside this fact-check brief and were not examined here.
