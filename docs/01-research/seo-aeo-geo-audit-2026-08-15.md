# RipoDoc SEO, AEO, and GEO Audit

**Audit date:** 2026-08-15
**Scope:** Public crawlability, indexation signals, entity disambiguation, answer-engine eligibility, and generative-engine eligibility.
**Methodological limit:** Search ranking, Google Knowledge Graph inclusion, Google Search Console coverage, Bing Webmaster coverage, and closed-AI retrieval/answer behavior are not fully observable without verified owner access or each provider’s private telemetry. This audit labels those states as **unverified**, rather than inferring success.

## Live baseline

| Signal | Publicly observed state | Audit implication |
| --- | --- | --- |
| Canonical homepage | `https://www.ripodoc.com/` rendered successfully and presents an original product explanation, live sample, MSP-specific language, a method page, evidence-readiness tool, self-host path, security surface, legal hub, and repository link. | Strong content and internal-discovery foundation. |
| Exact brand discovery | Public search for `RipoDoc`, `RipoDoc MSP reporting`, and `ripodoc.com evidence delivery` returned unrelated **ripperdoc** and other MSP acronym results rather than the RipoDoc site. | Exact-name discoverability is currently weak and brand/entity disambiguation is the primary external discovery problem. |
| Robots policy | Public `robots.txt` allows public product and legal surfaces; it blocks private account and API routes; it declares the canonical sitemap. | Healthy crawl boundary. |
| XML sitemap | The sitemap is publicly served and includes homepage, method, MSP demo, readiness, security, download, partner, and legal routes. | Healthy URL-discovery foundation; ingestion remains unverified until Search Console/Bing verification. |
| `llms.txt` | A public product map describes the exact category, canonical sources, terminology, and important limits. | Useful voluntary signal for crawlers that choose to read it; it is not a standard guarantee of LLM indexing or recommendation. |
| Public entity language | Homepage and `llms.txt` use the consistent name **RipoDoc** and category **controlled evidence delivery for MSP client reports**. | Correct start for entity disambiguation; insufficient external corroboration currently exists. |

## Initial conclusion

The production site is technically discoverable, semantically clear, and truthful about product boundaries. It is **not yet visibly indexed for its exact brand name** in the inspected public results. The immediate audit priority is therefore to separate:

1. technical readiness that is already live;
2. third-party index/knowledge states that must be verified in owner consoles; and
3. external authority signals that cannot be manufactured by site metadata alone.

## Public sources inspected

1. [RipoDoc homepage](https://www.ripodoc.com/)
2. [RipoDoc robots policy](https://www.ripodoc.com/robots.txt)
3. [RipoDoc XML sitemap](https://www.ripodoc.com/sitemap.xml)
4. [RipoDoc machine-readable product map](https://www.ripodoc.com/llms.txt)
5. Public web search results for the exact brand and brand/category variants, captured on the audit date.

## Phase 2 — Technical SEO and consent baseline

### Crawlability and canonical control

Every public discovery URL tested on 2026-08-15 returned `200 text/html; charset=utf-8`, rendered an explicit canonical URL, and emitted `robots=index, follow`. The tested set covered the homepage, method, MSP, readiness, security, download, founding-partner, legal hub, and all seven public legal-status pages. No sitemap URL was found behind authentication or a `noindex` directive.

| Technical signal | Observed production state | Assessment |
| --- | --- | --- |
| HTTP transport and cache policy | Homepage responds over HTTPS with a two-year HSTS policy, HTML content type, and a production CSP. | **Pass.** |
| Public route availability | 15 sitemap destinations: 15 returned `200`, canonical, and index/follow. | **Pass.** |
| Robots and sitemap discovery | Root-level `robots.txt` permits `/`, identifies the canonical sitemap, and disallows private accounts and API routes. | **Pass.** Explicit public-route `Allow` entries are redundant when `Allow: /` exists, but can improve human review of the discovery intent. |
| XML sitemap | 15 absolute canonical public URLs served from the root. | **Improve.** It contains `changefreq` and `priority`, which Google ignores; it has no truthful `lastmod` values. Google says `lastmod` is used when consistently accurate and reflects a significant update. [1] |
| Metadata | Homepage server HTML includes a description, canonical, Open Graph title/description/URL/image/alt, and `summary_large_image` Twitter metadata. | **Pass.** |
| Structured data | Production JSON-LD parses cleanly. Home emits `Organization`, `WebSite`, and `SoftwareApplication`; method, MSP, and readiness pages additionally emit `FAQPage`. | **Pass.** The data is visible in server HTML and describes published content, as Google requires. [2] |
| Entity identifiers | Organization `@id`, WebSite `@id`, SoftwareApplication `@id`, canonical domain, logo URL, and GitHub `sameAs` are all present. | **Pass with a limit.** This is a strong owned-web foundation, but not independent corroboration or a confirmed knowledge panel. |
| Social image endpoint | `/opengraph-image` is 1200×630 PNG and transfers about 67 KB. | **Pass.** |
| Primary logo asset | At audit start, `/ripodoc-mark.png` transferred about **1.15 MB** at 1920×1920. The Phase 4 asset optimization preserves the transparent mark at 512×512 and **97,588 bytes** (about 95.3 KiB). | **Remediated.** The optimized image remains substantially above Google’s minimum 112×112 logo guidance while removing about 91.5% of transferred bytes. |
| Cookie handling | The public site currently declares only session and CSRF cookies; no reviewed frontend code imports analytics, advertising, replay, marketing pixel, support chat, or experimentation SDKs. The prior notice was an acknowledgement only. | **Improve.** Replace the acknowledgement-only UI with transparent accept, reject, and settings controls. Necessary storage will remain always-on; optional categories remain off because no optional provider exists. |

### Structured-data validation

The live structured-data checker successfully parsed every JSON-LD payload on the homepage, method, MSP, readiness, and download pages. The exact home graph comprises `Organization`, `WebSite`, and `SoftwareApplication`, joined by stable `@id` references. This implementation aligns with Google’s recommendation to use accurate JSON-LD and its documented use of Organization markup to help understand and disambiguate organizations. [2] [3]

The organization graph already includes the only verified external profile currently available: the GitHub repository. The audit will not add speculative social profiles, addresses, legal names, identifiers, pricing, reviews, or compliance attributes. Google advises using organization properties that actually apply to the organization; fabricated data would create an inaccurate public claim rather than a discoverability advantage. [3]

### Search Console, indexing, and knowledge-graph limits

The authenticated Search Console check could not complete because the browsing bridge was interrupted twice before a property view loaded. Accordingly, the following remain **unverified**: Google’s selected canonical, Crawl/Index status, sitemap processing, Rich Results reports, Google Knowledge Graph inclusion, query impressions, clicks, positions, and manual actions. Search Console is the authoritative surface for those owner-specific signals and for URL inspection/crawl requests. [4]

Public exact-brand searches do not show the RipoDoc site in the returned result set. The observed results were dominated by the unrelated Cyberpunk **ripperdoc** term and unrelated meanings of the MSP acronym. This is evidence of an early-stage exact-match entity-collision problem, not evidence that any search engine has permanently excluded the domain.

### Technical remediation decision

The validated, high-impact technical work is to compress the primary mark without degrading its white-background legibility, add accurate sitemap `lastmod` timestamps, make intended public routes explicit in robots policy for reviewer clarity, and add the requested transparent consent-preference interface. The optional public `Allow` lines will not be represented as a ranking technique. Owner access is still required to submit the sitemap, inspect live Google index status, and request crawl/indexing after publication.

## Phase 3 — AEO, GEO, entity, and AI-workflow assessment

### Answer-engine readiness

RipoDoc’s public answer surfaces are substantially stronger than the public exact-brand result set. The method, MSP, and evidence-readiness pages use server-rendered questions as headings followed by direct, self-contained answers. They answer the questions most relevant to the product’s boundary: whether RipoDoc replaces PSA/RMM/BI/portal systems; whether an arbitrary PDF can be proved; what happens on forwarding; whether the public demo uses client data; whether the readiness check sends report data; and whether the product is a compliance certification.

| AEO signal | Verified state | Meaning |
| --- | --- | --- |
| Question-first structure | Three public pages expose a visible **Direct answers**/FAQ section in server HTML. | Strong eligibility for retrieval and citation because the answer is readable without client-side interaction. |
| FAQ structured data | Live JSON-LD parsing found `FAQPage` on `/how-it-works`, `/for-msps`, and `/report-evidence-readiness`. | Correct semantic accompaniment to visible content; it is not a promise of a Google FAQ rich result. |
| Claim discipline | Pages clearly state product limits, sample-data status, and hosted fail-closed status. | **Strength.** Truthful boundaries improve citation safety and reduce the risk of answer engines repeating unsupported claims. |
| Product category | The homepage, method, MSP page, download page, Organization JSON-LD, SoftwareApplication JSON-LD, and `llms.txt` converge on **controlled evidence delivery for MSP client reports**. | Strong first-party entity coherence. |
| Citation depth | The product pages explain a distinct method, but they offer few externally citable, dated field guides or customer outcome studies. | **Primary content gap.** Search and answer engines have limited third-party authority or original research to corroborate the entity. |
| Brand definition | The brand is defined across owned pages, yet there is no dedicated, durable `/about` page with a concise plain-language definition and founding/ownership context. | **Improve.** A purpose-built entity page can reinforce RipoDoc’s distinction from the unrelated `ripperdoc` term. |

The public `llms.txt` is accurate, useful, and unusually clear on product limits. It contains canonical pages, exact terminology, and exclusions. It should remain available, but it must not be treated as a standardized instruction that forces an LLM to index, cite, or recommend the site. The durable signals remain public crawlability, original useful content, explicit entity markup, trusted external corroboration, and the individual retrieval/ranking systems’ decisions.

### Generative-engine and crawler eligibility

RipoDoc’s wildcard robots policy currently permits public pages for crawlers that honor standard robots rules. Under OpenAI’s documentation, that means the site is **not opted out** of OAI-SearchBot, and therefore is eligible for OpenAI’s ChatGPT Search crawler at the policy layer. OpenAI states that OAI-SearchBot is used to surface websites in ChatGPT Search and recommends allowing it in `robots.txt`; it also distinguishes that crawler from GPTBot’s model-training purpose. [5]

| System or signal | Verified policy state | What cannot be inferred |
| --- | --- | --- |
| Google Search | Public routes are crawlable, canonicalized, server-rendered, and listed in a root sitemap. | Crawl completion, selected canonical, index inclusion, rank, featured display, AI Overview grounding, and Knowledge Graph inclusion remain unverified without Search Console. Google explicitly does not guarantee crawling, indexing, or serving. [6] |
| ChatGPT Search | `User-Agent: *` permits public routes, which includes OAI-SearchBot absent a more specific conflicting rule. | Whether OpenAI has crawled, indexed, retrieved, cited, or recommended RipoDoc. OpenAI does not publish a site-owner citation report. |
| GPTBot | Also permitted by the wildcard policy. | Training use, ingestion timing, model behavior, and future model responses. This is a separate policy decision from ChatGPT Search. [5] |
| Other answer engines | No explicit public opt-out was found for public routes. | Actual crawls, grounding, citation, and recommendation behavior; each provider chooses its own crawler and retrieval system. |
| `llms.txt` | Public, accurate product map. | Any crawler adoption, indexing benefit, answer-engine output, or ranking effect. |

RipoDoc should make intended public paths explicit for human governance, including `/how-it-works`, `/for-msps`, `/report-evidence-readiness`, and `/llms.txt`. The current `Allow: /` already permits them; named rules provide clarity rather than a ranking promise. The release should add a named `OAI-SearchBot` policy that explicitly permits public pages while maintaining the existing private-route exclusions. The owner should decide separately whether GPTBot training access remains allowed after reviewing the business’s AI data-use preference.

### Entity and knowledge-graph assessment

The owned-web entity graph is coherent: consistent exact casing of **RipoDoc** in titles and entity markup, organization URL, site URL, software URL, logo, category language, and GitHub `sameAs`. The public search footprint is still weak: exact-name searches are dominated by the unrelated Cyberpunk **ripperdoc** concept, although a later brand/category search did return the RipoDoc homepage. That is an early indication of retrievability, not a confirmed entity panel or independent knowledge-graph presence.

The audit found no independently corroborating Wikidata item, reputable directory profile, customer case study, third-party article, review profile, or official organization registry link to add truthfully to `sameAs`. The correct response is not to fabricate those links or claim a knowledge panel. It is to publish a precise owned entity page, keep metadata and structured data stable, preserve an active open-source repository, earn real third-party references through launch work, and then connect only verified external profiles.

### Authenticated AI-assisted PDF customization research

The user asked whether RipoDoc needs a signed-in dashboard and AI-assisted PDF customization. The answer is **yes, with a controlled product boundary**. The detailed research record is available at [AI-assisted dashboard workflow recommendation](./ai-assisted-dashboard-workflow-recommendation-2026-08-15.md).

The application already has sign-in, sign-up, verification, recovery, a tenant-scoped server dashboard, and a report authoring route. The live hosted workspace correctly remains fail-closed because durable database, identity, email, CAPTCHA, audit, and private-worker services are not configured. The dashboard is therefore not appropriate for public search or anonymous use.

The recommended future product is an authenticated **AI Report Studio** that drafts a summary or bounded presentation configuration from user-selected, already approved, tenant-scoped structured inputs. It must produce validated schema-bound drafts, show a source/diff/review interface, and never create evidence, expand access, make a compliance determination, publish, share, or approve a report autonomously. This directly addresses the prompt-injection, sensitive-data disclosure, excessive-agency, and misinformation risks catalogued by OWASP. [7] [8] No AI model integration will be enabled on the current hosted deployment before a provider/data-flow decision, customer authorization model, durable tenant/audit controls, adversarial testing, and explicit human approval gate exist.

### Phase 3 decision

The current public content is eligible for crawling and answer retrieval, but it cannot yet be described as externally established in Google’s knowledge graph or as indexed/cited by any specific AI engine. The release should implement the owned-web improvements that are fully within RipoDoc’s control: dedicated entity content, public crawler-policy clarity, sitemap freshness, logo performance, and private-route `noindex` metadata. It should not claim guaranteed ranking, AI recommendation, knowledge-panel inclusion, or AI processing readiness.

## Phase 4 — Implemented improvements

| Improvement | Implementation | Audit rationale |
| --- | --- | --- |
| Lightweight primary logo | Resized and optimized `ripodoc-mark.png` from 1920×1920 / about 1.15 MB to transparent 512×512 / 97,588 bytes. | Reduces transferred bytes by about 91.5% while retaining a logo substantially above the 112×112 minimum described in Google’s organization-markup guidance. [3] |
| Explicit crawler policy | `robots.txt` now names the principal public discovery routes and private exclusions. A dedicated `OAI-SearchBot` policy permits the same public paths and excludes private ones. | Clarifies intent for reviewers and ChatGPT Search’s documented crawler without representing an allow rule as a crawl, ranking, or citation guarantee. [5] |
| Sitemap freshness | Every public sitemap entry now includes an accurate material-update `lastmod`; the new `/about` page is included. | Supplies a documented freshness hint while retaining the correct expectation that a sitemap does not force indexing. [1] [6] |
| Dedicated entity page | Added `/about` with a concise definition, exact brand casing, category language, boundaries, source links, and server-rendered `AboutPage` JSON-LD tied to the existing Organization and SoftwareApplication identifiers. | Gives humans and retrieval systems a durable canonical place to disambiguate **RipoDoc** as controlled evidence delivery for MSP client reports. |
| Machine-readable product map | Added `/about` to `llms.txt`. | Keeps the first-party product map internally coherent without claiming any specific crawler supports or ranks `llms.txt`. |
| Private-route index exclusion | Added centralized `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` responses for dashboard, authoring, administrator, account, recovery, verification, and tokenized evidence routes. | Separates public discovery from the authenticated product boundary and reduces the risk of private/application URLs becoming public-result candidates. |
| Consent controls | Replaced the acknowledgement-only notice with **Accept**, **Reject**, and **Cookie settings** controls; choices persist locally under `ripodoc-cookie-preferences-v1`. Settings are reopenable from the footer. | Provides a transparent, accessible, mobile-friendly preference interface while accurately keeping analytics and marketing categories disabled because no optional provider is active. |
| Cookie disclosure alignment | Updated the cookie-status page to describe the local preference record, non-active optional categories, and required change control before an optional provider can run. | Avoids an inaccurate generic consent claim and preserves the necessary security-cookie boundary. |
| Regression coverage | Added discovery/auth boundary and consent control assertions to the existing runtime suite. | Prevents the new public/private route policy and consent UI from being silently removed or weakened. |

## Phase 5 — Validation results

| Check | Result | Evidence |
| --- | --- | --- |
| TypeScript, automated tests, and production build | **Pass.** | `npm run verify` completed with **149 passing tests**, strict type checking, and a Next.js production build that generated the new `/about` route. |
| Lint | **Pass.** | `npm run lint` completed without findings. |
| Public discovery endpoints | **Pass.** | Local responses for `/`, `/about`, `/robots.txt`, `/sitemap.xml`, and `/llms.txt` returned HTTP 200 with the expected HTML, plain-text, or XML content types. |
| Private route headers | **Pass.** | Local responses for dashboard, login, sign-up, recovery, verification, upload, administrator, and tokenized evidence responses carried the required `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`. |
| Robots and sitemap output | **Pass.** | Generated robots policy lists public discovery routes and `OAI-SearchBot`; sitemap contains 16 public URLs with the 2026-08-15 `lastmod` timestamp. |
| Entity page output | **Pass.** | The local `/about` HTML contains the exact category statement and `AboutPage` JSON-LD. |
| Logo visual quality | **Pass.** | Side-by-side inspection of the original and optimized transparent mark confirmed retained legibility at the delivered 512×512 size. |
| Consent responsive rendering | **Pass.** | Headless Chromium screenshots at 390×844 and 768×1024 show all three controls fully visible, legible, and within the viewport; see `var/seo-consent-validation/responsive-consent-inspection.md`. |
| Browser-protocol interaction harness | **Limited.** | Three attempts to synchronize the isolated DevTools harness with the initial client render did not complete. No product defect was demonstrated; the browser-level interaction harness was stopped rather than modifying production logic blindly. The completed type, static test, build, HTTP, and visual checks remain valid. |

## Residual limits and owner actions

The following outcomes are intentionally **not** claimed as completed because they require real search-engine or provider decisions rather than code changes:

| Owner action | Why it remains necessary |
| --- | --- |
| Verify `www.ripodoc.com` in Google Search Console. | Search Console access is the authoritative route to live crawl/index status, selected canonical, query impressions, and indexing requests. |
| Submit `https://www.ripodoc.com/sitemap.xml` and request the home/about pages for indexing after the release is live. | A valid sitemap and public HTML are discovery inputs, not indexing commands. [1] [6] |
| Review whether to allow `GPTBot` separately from `OAI-SearchBot`. | ChatGPT Search and model-training crawler policy are distinct in OpenAI’s documentation. [5] |
| Establish real external corroboration. | Only add Wikidata, directories, review profiles, press, customer case studies, or social `sameAs` links after they genuinely exist and are owner-approved. |
| Decide production AI-provider and data-flow governance before enabling AI Report Studio. | The hosted workspace is fail-closed and an AI model/provider integration remains deliberately disabled until the documented tenant, provider, privacy, security, audit, and human-review release gate passes. [7] [8] |

## References

[1]: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap "Google Search Central — Build and submit a sitemap"
[2]: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data "Google Search Central — Introduction to structured data markup"
[3]: https://developers.google.com/search/docs/appearance/structured-data/organization "Google Search Central — Organization structured data"
[4]: https://search.google.com/search-console/about "Google Search Console"
[5]: https://developers.openai.com/api/docs/bots "OpenAI — Overview of OpenAI Crawlers"
[6]: https://developers.google.com/search/docs/fundamentals/how-search-works "Google Search Central — How Google Search works"
[7]: https://genai.owasp.org/llmrisk/llm01-prompt-injection/ "OWASP LLM01:2025 — Prompt Injection"
[8]: https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/ "OWASP LLM02:2025 — Sensitive Information Disclosure"
