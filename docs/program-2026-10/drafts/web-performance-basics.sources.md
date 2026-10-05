# Sources: web-performance-basics

R = fetched the page itself (the fetch tool summarises, so wording is paraphrase). S = search summary only. C = arithmetic, repo evidence or general knowledge, no single source.

- LCP 2.5 s, INP 200 ms, CLS 0.1, 75th percentile, mobile and desktop segmented; INP replaced FID, stable in 2024. R. https://web.dev/articles/vitals
- INP bands 200 / 500 ms; counts clicks, taps, key presses; three phases (input delay, processing, presentation delay). R. https://web.dev/articles/inp
- LCP poor above 4.0 s; eligible elements; four parts (TTFB, load delay, load duration, render delay). R. https://web.dev/articles/lcp
- LCP target split about 40 / under 10 / 40 / under 10 percent; fetchpriority="high", discoverable in HTML, avoid lazy-loading LCP. R. https://web.dev/articles/optimize-lcp
- CLS poor above 0.25; session window 1 s gap, 5 s max; causes (no dimensions, fonts, ads). R. https://web.dev/articles/cls
- Long task over 50 ms; scheduler.yield() with setTimeout fallback; yield about every 50 ms. R. https://web.dev/articles/optimize-long-tasks
- Lighthouse 10 weights (TBT 30, LCP 25, CLS 25, FCP 10, Speed Index 10). R. https://developer.chrome.com/docs/lighthouse/performance/performance-scoring
- Lab vs field; CrUX 75th percentile over 28 days; why they diverge. R. https://web.dev/articles/lab-and-field-data-differences
- Critical rendering path; render-blocking CSS, parser-blocking JS. R. https://web.dev/articles/critical-rendering-path
- Cache-Control: public, max-age=31536000, immutable for versioned files; no-cache plus ETag for HTML; no-cache vs no-store. R. https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
- Brotli 14 / 21 / 17 percent smaller than gzip (JS / HTML / CSS, attributed to CertSimple); 225 KB bundle to 53.1 KB vs 61.6 KB gzip. R. https://web.dev/articles/codelab-text-compression-brotli
- font-display values and block/swap periods (no durations read). R. https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display
- loading="lazy", do not lazy-load LCP image, width and height, fetchpriority. R. https://web.dev/articles/browser-level-image-lazy-loading
- WebP and AVIF compress better than JPEG; video instead of GIF; no percentages used. R. https://web.dev/articles/choose-the-right-image-format
- V8: median phone 3 to 4x, low-end over 6x JS execution time; bundles 50 to 100 kB; code cache after two visits (not used in the draft). R, 2019 article. https://v8.dev/blog/cost-of-javascript-2019
- Service worker lifecycle, cache-first, old worker stays until pages close, skipWaiting, HTTPS. R. https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
- AppLovin playable: single HTML, 5 MB or smaller, embedded resources, no external network calls, MRAID 2.0 (the draft cites only size and no external calls). R. https://support.applovin.com/en/growth/promoting-your-apps/creatives/best-practices-and-guidelines
- Unity Ads playable: single minified index.html under 5 MB, MRAID 3.0, no XHR except permitted analytics. S (search summary quoting the official page; page not fetched). https://docs.unity.com/en-us/user-acquisition/creatives/creative-specifications
- Per-network table (Meta 2 MB single HTML or 5 MB ZIP; Google Ads, Mintegral, TikTok, Liftoff 5 MB; Moloco under 5 MB). R but secondary (a vendor blog), no primary page read for Meta, Google, Mintegral, TikTok, Liftoff or Moloco; the fact-checker should confirm against each network's own page. https://segwise.ai/blog/playable-ad-specs-by-network-2026
- Godot web export: .wasm about a quarter size with gzip; Brotli precompression; single-threaded default since 4.3; COOP and COEP for threads; WebGL 2.0 only. R. https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html
- Unity WebGL: Gzip default, Brotli, Disabled; Content-Encoding headers; application/wasm for streaming compilation; Decompression Fallback adds a JS decompressor. R. https://docs.unity3d.com/6000.0/Documentation/Manual/webgl-deploying.html
- "Brotli needs HTTPS" in the Unity pitfall comes from the fetch summary of the Unity page. R (summary).
- "Base64 adds about a third" to binary assets: 4 output bytes per 3 input bytes. C.
- Site case study: one 8.7 MB file (2.8 MB gzipped) to a 292 KB page plus per-page content files. C: repo commit "Split: a 292 KB page plus content files loaded per page" and the owner's brief; CONTRIBUTING.md "How the page loads content".

## Not verified
- Godot snippet (HTTPRequest download_file with a user:// path, then load_resource_pack) and Unity snippet (UnityWebRequestAssetBundle) were not compiled or run, and the Godot download_file behaviour in a web export was not checked against the docs.
- Godot has HTTPRequest.get_downloaded_bytes() (mentioned in the Unity map text) from general knowledge, not fetched.
- The WebAssembly streaming web.dev page returned 404; streaming-compile claim rests on the Unity manual only.
- No primary source was read for Meta, Google Ads, Mintegral, TikTok, Liftoff or Moloco playable caps. Ironsource is not mentioned.

## Changes after the fact-check (2026-10-05)

- WRONG, Meta cap: removed every "Meta 2 MB single file" claim (what, why, TECH inline build, senior interview, facts). Now: Meta single HTML5 file up to 5 MB, ZIP up to 5 MB with at most 100 files. R (fact-checker read the page in en_US and vi_VN). https://www.facebook.com/business/help/412951382532338. Consistent with sibling soft-launch-and-playable-ads.
- Google Ads: ZIP only, max 5 MB, 512 files; the draft no longer says Google "allows" a ZIP. R (per fact-check). https://support.google.com/google-ads/answer/9981650
- UNSUPPORTED, Mintegral, TikTok, Liftoff, Moloco: removed from the claims and from facts; the segwise blog fact is gone because it is wrong on Meta. The facts entry says these were not confirmed on a primary page.
- UNSUPPORTED, "required by most networks": now "AppLovin and Unity Ads require one HTML file; Meta allows HTML or ZIP; Google requires a ZIP". Sources as above plus the AppLovin and Unity pages already listed.
- WRONG, INP trap: reworded. INP ignores the highest interaction per 50 interactions, so it reports the worst or near-worst, not the average. R (fact-check). https://web.dev/articles/inp
- WRONG, site case: "292 KB" is gzipped; text now says "2.8 MB gzipped to a 292 KB gzipped page". C: docs/program-2026-10/research/split-architecture.md (8,734,466 B raw, 2,844,545 B gzipped before; 292 KB gzipped after).
- WRONG, diagram note: LCP spans the first five boxes (through layout and first paint), since LCP ends when the element is painted. https://web.dev/articles/optimize-lcp
- UNSUPPORTED, Godot download to user:// on the web: pitfall now says untested in a web export and that the web user:// is IndexedDB-backed and may not persist (per the fact-check's reading of the Godot web export doc). https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html. Page wording "this page's author did not run it" replaced.
- Teaching: start-script size aligned to V8's 50-100 kB split guidance (https://v8.dev/blog/cost-of-javascript-2019). Unity pitfall and facts now state that Decompression Fallback disables WebAssembly streaming compilation (Unity manual, as quoted in the fact-check: https://docs.unity3d.com/6000.0/Documentation/Manual/webgl-deploying.html). Unity snippet gained a one-line comment about Unload.
- Missing coverage, critical rendering path: added a how step (DOM, CSSOM, render tree; CSS blocks rendering, scripts block the parser). R, summarised by the fetch tool; wording is paraphrase. https://web.dev/articles/critical-rendering-path
- Missing coverage, WebGPU: only "Godot 4 web is WebGL 2.0 only" (Godot doc, above) and an instruction to check the engine manual. The Unity 6 manual page webgl-graphics (https://docs.unity3d.com/6000.0/Documentation/Manual/webgl-graphics.html) was read and states WebGL 2.0 by default and does not mention WebGPU, so no Unity WebGPU claim is made. Not verified: Unity 6 WebGPU status.
- Sibling repetition: Godot pitfall and the how step now point to infra-cdn-assets and soft-launch-and-playable-ads instead of restating them.
- Not changed: snippets stay within 15 lines and 900 characters (the Unity snippet is 14 lines after the comment was added).
