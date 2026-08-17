# RipoDoc Proof Theatre Performance and SEO Audit

**Date:** 18 August 2026  
**Audit target:** [https://www.ripodoc.com/][1]  
**Method:** Live HTTP inspection, Chromium CDP laboratory pass, rendered desktop/mobile review, deployed-HTML metadata inventory, crawler-file inspection, and public discovery search.

## Executive assessment

The Proof Theatre homepage has a strong technical discovery foundation. The deployed page carries a canonical URL, index/follow controls, social metadata, one primary heading, organization/site/software structured data, a sitemap, restrictive crawler separation for private routes, and an `llms.txt` product/entity definition. [1] [2] [3] [4] The new release preserves that foundation and adds a visible category sentence: **“RipoDoc is controlled evidence delivery for MSP client reports.”** This makes the durable category legible to crawlers and AI readers without replacing the selected creative headline.

The major performance risk is not JavaScript weight or layout instability in the observed pass; it is **cold mobile response time**. A single 4G-latency synthetic run measured a 5.42 s TTFB and a 6.76 s FCP/LCP, while an unthrottled desktop run measured 0.87 s TTFB and 1.48 s FCP/LCP. These are reproducible laboratory signals, not field data or a CrUX percentile. The anonymous PageSpeed Insights requests were rejected by the API’s quota limit, so this audit does not claim a Google PageSpeed score.

> **Audit conclusion:** Search technical hygiene is strong. The next performance priority is first-party field measurement and investigation of slow cold mobile response behavior—not a speculative visual rebuild or a generic SEO keyword expansion.

## Verified performance observations

| Signal | Mobile 4G-latency lab | Desktop unthrottled lab | Interpretation |
| --- | ---: | ---: | --- |
| Time to first byte | 5.42 s | 0.87 s | Cold/throttled mobile response needs investigation. |
| First contentful paint | 6.76 s | 1.48 s | The slow mobile response dominated first paint in this run. |
| Largest contentful paint | 6.76 s | 1.48 s | The hero heading was the LCP candidate in the observed run. |
| Cumulative layout shift | 0.0017 | 0 | No meaningful layout instability was measured. |
| Long-task time | 0 ms | 0 ms | No post-load long tasks were observed in this pass. |
| Resource count | 21 | 30 | The first view is not resource-heavy. |
| Cold transfer | 270 KB | 32 KB warm cache | The mobile run attributed about 158 KB to JavaScript. |

The live HTML response was HTTP 200, and a representative Next.js JavaScript asset used an immutable one-year cache-control policy. The live response also exposed an HSTS policy and a restrictive content-security-policy. [1]

## Verified SEO, AEO, and GEO observations

| Surface | Result | Audit status |
| --- | --- | --- |
| Canonical URL | `https://www.ripodoc.com/` | Pass |
| Robots meta | `index, follow` | Pass |
| Googlebot directives | Permissive snippet and large image preview directives | Pass |
| Title | Brand plus “controlled evidence delivery for MSP client reports” | Pass |
| Description | Accurate MSP client-report and recipient-aware evidence positioning | Pass |
| H1 | “The report opens. The answer has a scene.” | Pass, now reinforced by nearby category copy |
| Open Graph / X | Title, description, 1200×630 image, and alt text | Pass |
| Structured data | `Organization`, `WebSite`, and `SoftwareApplication` | Pass |
| XML sitemap | Homepage and major indexable routes listed | Pass; freshness fix shipped |
| robots.txt | Public marketing allowed; API, admin, workspace, authoring, auth, and tokenized evidence paths disallowed | Pass |
| `llms.txt` | Canonical sources, exact terminology, boundaries, and self-hosted context | Pass |
| Public discovery query | RipoDoc appears as a distinct product result | Positive entity evidence, not a ranking guarantee |

The crawler controls deliberately separate public entity content from private dashboards, upload routes, authentication, APIs, and recipient evidence links. [2] The AI-oriented product definition names the category, describes product limits, and links canonical public sources. [4]

## Fixes shipped in this release

| Improvement | Why it matters | Implementation boundary |
| --- | --- | --- |
| Build-time sitemap `lastmod` | Removes the stale manually maintained date observed on the prior live sitemap. | Each static production build now writes its current build timestamp. |
| Visible category reinforcement | Lets crawlers and AI readers understand the product category alongside the creative H1. | Preserves the Proof Theatre motto and headline. |
| Optional first-party Web Vitals reporter | Enables real-user measurement instead of relying on one synthetic run. | Disabled by default; emits only metric name, numeric value, rating, navigation type, and timestamp. |
| Strict telemetry endpoint validation | Prevents accidental collection of recipient, report, token, or source-row data. | Requires opt-in server logging, same-origin request, JSON content type, and a bounded payload. |
| Operations console and Proof Brief | Converts secure-delivery competitive research into a claim-level proof workflow. | Uses immutable manifest facts, tenant-scoped reports, recipient-safe labels, and optional durable audit summaries. |

## Remaining operator actions

The application cannot retrieve Google Search Console ownership data, field CrUX percentiles, or a verified indexing state without the site owner. The owner should verify the domain in Google Search Console, submit/inspect the sitemap, and review real-user Core Web Vitals after the new reporting flag has been deliberately enabled and enough traffic exists. [5] The anonymous public PageSpeed API call failed due to a quota restriction; rerun PageSpeed from an authorized Google project or the PageSpeed web interface before assigning a score.

For self-hosted deployments, field telemetry requires both `NEXT_PUBLIC_RIPODOC_WEB_VITALS_ENABLED=true` at **build time** and `RIPODOC_WEB_VITALS_LOG=true` at runtime. The operational runbook documents the privacy boundary, rebuild requirement, and log-retention responsibility. [6]

## Release validation

The implementation passed `npm run lint`, full typechecking, **161 automated tests**, and an optimized production build. The public homepage was rendered at 1440 px and 390 px; the selected Proof Theatre composition and mobile gutter behavior remained intact. The sitewide 390 px audit found no horizontal scrolling, overflow, or reader-facing safe-gutter violation on audited public, legal, authentication, readiness, upload, and tool routes.

## References

[1]: https://www.ripodoc.com/ "RipoDoc production homepage"
[2]: https://www.ripodoc.com/robots.txt "RipoDoc crawler directives"
[3]: https://www.ripodoc.com/sitemap.xml "RipoDoc XML sitemap"
[4]: https://www.ripodoc.com/llms.txt "RipoDoc AI reader guidance"
[5]: https://support.google.com/webmasters/answer/7451184 "Google Search Console — Verify site ownership"
[6]: ../../05-engineering/self-hosted-operations-runbook.md "RipoDoc self-hosted operations runbook"
