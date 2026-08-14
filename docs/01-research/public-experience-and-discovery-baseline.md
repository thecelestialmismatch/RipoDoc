# RipoDoc Public Experience and Discovery Baseline

**Assessment date:** 2026-08-14 (Australia/Sydney)  
**Scope:** Live public site, repository presentation, and discoverability foundations before the public-experience rebuild.

## Executive finding

RipoDoc already has a credible product demonstration, a clear evidence-control differentiator, security-conscious public messaging, and a real downloadable self-hosted path. The next opportunity is not to inflate claims. It is to convert those assets into a more distinctive narrative, a shorter high-signal journey for MSP operators, discoverable original content, and a repository that demonstrates trust and welcomes contributors.

> The public site must stay evidence-accurate: the hosted customer plane remains fail-closed until durable authentication, email, CAPTCHA, audit, and worker dependencies are configured. The redesign should lead with the tangible PDF-to-proof workflow while making deployment options and operational boundaries easy to understand.

## Verified live-site baseline

| Area | Current strength | Gap to resolve in redesign |
|---|---|---|
| Product story | The homepage has a strong, specific core line: every report figure has proof behind it. It includes an interactive sample report, controlled access language, and MSP context. | The homepage repeats its core claim across several sections and offers three competing hero actions. It needs a clearer primary journey: observe the report moment → understand the control boundary → choose a next step. |
| Visual language | Navy, blue, teal, report imagery, and the evidence interaction establish a professional starting point. | The system relies heavily on rounded cards, soft gradients, and conventional SaaS hero patterns. The redesign should use a more ownable “proof canvas” visual grammar: document margin, evidence rail, editorial hierarchy, and deliberate data marks. |
| Conversion | Founding-partner, interactive-demo, self-host, security, and legal routes exist. | A qualified MSP must decide between hosted/founding-partner, self-hosted, or research/technical evaluation quickly. Conversion choices should be staged by intent rather than shown as co-equal calls to action. |
| Trust | Public security, legal status, self-hosting, and GitHub routes are visible. | Trust material is available but scattered. The homepage should expose a short “what is live / what is self-hosted / what is restricted” proof strip linking to deeper material. |
| Semantic content | The home page uses a visible H1, sections, and meaningful product language. | There is no dedicated public knowledge/resource center answering high-intent MSP questions or explaining the workflow with original research and clear authorship. |

## Technical-discovery baseline

| Control | Current state | Required release action |
|---|---|---|
| Page metadata | Root layout supplies one global title and description. | Add unique route metadata, metadata base, canonicals, Open Graph, Twitter/X, robots directives, and richer social previews. |
| Sitemap and robots | No source `robots`, `sitemap`, manifest, or social-image route was found in the application. | Implement crawl controls that index public pages and block private/account/API/evidence routes; publish a generated sitemap of approved public pages. |
| Structured data | No JSON-LD implementation was identified in app source. | Add accurate Organization/SoftwareApplication/WebSite JSON-LD only for visible, verified facts; add FAQ schema only where a visible FAQ is maintained. |
| Answer-engine discovery | No public first-party knowledge pages explain the non-commodity RipoDoc method in direct question-and-answer terms. | Add concise, original public pages that address how controlled PDF evidence works, what it is not, self-hosting, security boundaries, and MSP reporting workflow. |
| Geographic scope | The intended English-first US, Canada, UK, Australia, and New Zealand audience is documented, but no localized product variants or operations are verified. | Use English-default canonical content; do not create unsupported locale pages or hreflang variants. Add geography only when a real localized product/legal/support offer exists. |
| Measurement | Vercel analytics had not been enabled in the prior audit. | Document Search Console/Bing Webmaster verification, sitemap submission, AI-performance monitoring, and privacy/cookie change-control steps as an operator checklist. |

## Repository baseline

| Signal | Observed state | Release action |
|---|---|---|
| Repository metadata | Public repository; homepage set; blank description; no topics; 1 star, 0 forks, 0 watchers. | Add an accurate repository description and relevant topics. Stars cannot be guaranteed; quality, clarity, and credible proof are the durable inputs. |
| Community health | GitHub community profile: 14%; no `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, issue templates, pull-request template, or community-health support files. | Add a focused contributor journey, security reporting path, conduct standard, issue/PR templates, support boundary, and release checklist. |
| README | Technically detailed and trustworthy, but long before the reader reaches the first local proof. | Rebuild around an immediate product sentence, visible workflow, fast local demo, two deployment paths, security model, explicit operating status, contribution entry points, and deep links. |

## Evidence-led discovery principles

Google’s official guidance is clear that generative-search visibility remains rooted in core search quality and crawlability; it prioritizes unique, helpful, people-first content rather than AEO/GEO hacks.[1] Public pages must be indexable and eligible for snippets; no implementation can guarantee indexing, ranking, or an AI recommendation.[1] Structured data should describe visible, accurate page content and is best maintained as JSON-LD.[2] OpenAI describes ChatGPT search as surfacing links to relevant web sources and gives site owners a choice to appear, reinforcing the value of original, accessible, sourceable product material.[3]

## References

[1]: [Google Search Central — Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
[2]: [Google Search Central — Introduction to structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
[3]: [OpenAI — Introducing ChatGPT search](https://openai.com/index/introducing-chatgpt-search/)

## Boundary

This assessment does not claim a ranking outcome, an AI-system recommendation, market traction, final legal readiness, or active hosted-account configuration. It identifies the highest-confidence implementation work that can make RipoDoc easier to understand, trust, crawl, cite, install, and contribute to.
