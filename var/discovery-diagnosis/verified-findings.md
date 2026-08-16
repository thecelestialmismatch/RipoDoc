# RipoDoc Discovery Diagnosis — Verified Findings

**Date:** 2026-08-16

## Public technical surface

| Check | Verified result | Interpretation |
| --- | --- | --- |
| Public home page | HTTP 200; substantive server-rendered text is retrievable | Crawlable public content exists; it is not a client-only blank page. |
| Public route metadata | `/`, `/about`, `/for-msps`, `/how-it-works`, `/report-diagnostic-starter-kit`, `/download`, and `/security` each return `index, follow` and a self-referencing canonical URL | No public noindex or canonical mismatch was found on the sampled pages. |
| robots.txt | Allows public crawl and links to the XML sitemap; only private/auth/API paths are disallowed | No crawl block was found for the public site. |
| Sitemap | A live sitemap lists the public product, method, MSP, resource, and legal URLs | URL discovery support exists, but a sitemap is not an indexation guarantee. |
| Structured data | Live pages emit JSON-LD; the home page emits Organization, WebSite, and SoftwareApplication entities; the About page emits AboutPage data | Entity and page semantics are present in the rendered HTML. |
| Machine-readable product map | `llms.txt` describes the exact product boundary and canonical URLs | It may help systems that elect to consume it, but Google’s official guidance says it does not improve Google Search or Google AI-feature visibility. |
| Public query observation | A public search result for `RipoDoc` surfaced the RipoDoc domain, but the result text used an earlier title; far more results use the similar Cyberpunk term “ripperdoc” | There is a positive crawl/index signal, but it is early/stale and the exact-name entity has weak authority against a high-volume spelling collision. |

## Official Google interpretation

Google states that pages must be indexed and eligible to appear with a snippet before they can be eligible as links in AI Overviews or AI Mode. It states that there are **no special AEO/GEO technical requirements**, and that satisfying requirements does not guarantee crawling, indexing, ranking, or inclusion. Google also states that its AI search features use the core Search index and ranking systems, and that it ignores `llms.txt` for Google Search purposes.

Google confirms that a sitemap helps discover URLs but does not guarantee crawling or indexing. It also states that individual recrawl requests require a Search Console owner/full user, can take days to weeks, and do not guarantee inclusion.

## Current diagnosis boundary

The public technical baseline is healthy in the sampled routes. The missing evidence is Search Console’s URL Inspection, Indexing, and AI performance information because the connected browser bridge timed out before the property could be read. No change has yet been made based on speculation.

## References

1. Google Search Central, “AI features and your website” — https://developers.google.com/search/docs/appearance/ai-features
2. Google Search Central, “Optimizing your website for generative AI features on Google Search” — https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
3. Google Search Central, “Ask Google to recrawl your URLs” — https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
4. Google Search Central, “Learn about sitemaps” — https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
