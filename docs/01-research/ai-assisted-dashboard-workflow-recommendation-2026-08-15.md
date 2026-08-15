# RipoDoc Authenticated AI-Assisted PDF Customization: Product and Safety Recommendation

**Decision date:** 2026-08-15
**Author:** Manus AI
**Status:** Research recommendation only — no hosted AI processing has been enabled.

## Executive decision

RipoDoc **should** add an AI-assisted capability after login, but it should be positioned as an **assistive report-customization studio**, never as an autonomous evidence author, publisher, approver, or security/compliance authority. The capability fits RipoDoc when it helps an authenticated MSP transform **already approved, tenant-scoped report facts** into a client-appropriate narrative and presentational draft. It does not fit when it is allowed to invent a metric, widen evidence scope, read arbitrary customer documents, decide the recipient, publish a report, issue an evidence link, or bypass the existing human review boundary.

| Surface | Recommended access model | Reason |
| --- | --- | --- |
| Public marketing, method, download, SEO/AEO/GEO content, and sample demo | **No login.** | These pages must remain crawlable, accessible, and useful before a buying decision. |
| Public interactive sample | **No login; fixture data only.** | It demonstrates the evidence experience without collecting customer report data. |
| Customer evidence view | **Recipient-bound evidence condition, not a general dashboard account by default.** | The product is designed to answer one claim without turning the client into a portal user. |
| MSP authoring, report registry, private manifests, AI assistance, and publication | **Verified tenant login, role checks, CSRF protection, and production preflight.** | These operations create, inspect, or alter sensitive client-report material. |
| Administrative controls | **Separate administrator authorization.** | Tenant-level and system-level controls must not be reachable through ordinary report-user roles. |

## What exists today

RipoDoc already contains these private-product foundations:

| Capability | Evidence in implementation | Current hosted status |
| --- | --- | --- |
| Sign in | `/login` uses a CSRF token, account form, and optional Turnstile component. | The page is publicly reachable, but configured account services report unavailable when their production prerequisites are absent. |
| Sign up, verification, recovery | `/signup`, `/verify-email`, `/forgot-password`, and `/reset-password` routes exist. | Intentionally fail-closed until durable database, email, CAPTCHA, and related release-gate requirements are configured. |
| Tenant dashboard | `/dashboard` calls `currentSessionUser()` on the server and redirects an unauthenticated request to `/login`; report retrieval is tenant-scoped before data reaches the client. | Real implementation exists; it cannot operate as a hosted production workspace until production services are configured. |
| Authoring workflow | `/upload` requires a manifest, sends a PDF through the verified workspace/session boundary, produces a placement proposal, requires human review, and then allows publication. | Designed for configured/self-hosted operation; not a live public SaaS workflow. |
| AI customization | No model call, AI provider configuration, AI output schema, prompt/data governance, or AI approval ledger is currently implemented. | Not enabled. |

The dashboard is therefore **not missing from the codebase**; it is deliberately unavailable as a durable hosted product until the required data, identity, email, CAPTCHA, audit, and worker services are configured. The needed work is to finish the launchable private-workspace operating environment and add an AI feature safely—not to expose private authoring behind a public demo.

## Recommended product: “AI Report Studio”

The first safe version should take an approved report manifest and an explicit user request such as *“prepare a concise executive summary for a 15-minute QBR”* or *“apply this client’s approved brand palette and section labels.”* It should return a **draft** that a named user reviews. The UI should make provenance visible: the source report version, selected report elements, approved inputs, model/provider, time, output status, and the person who approved any draft.

| Permitted v1 assistance | Required control |
| --- | --- |
| Draft an executive summary from user-selected, approved structured metrics and claims. | The output must cite the specific approved manifest elements supplied to the model and must not introduce metrics outside that input. |
| Adjust phrasing for a selected audience, length, tone, or meeting context. | The UI must mark the result as a draft and preserve the human-approved final text separately. |
| Propose presentation choices such as brand colors, section order, readable captions, and heading variants. | Customization must compile to a validated, bounded template/configuration schema; it cannot inject arbitrary HTML, JavaScript, external links, or PDF actions. |
| Suggest a report narrative gap or ask for a missing input. | It must report uncertainty rather than infer facts, approvals, compliance status, or risk. |
| Explain the evidence boundary attached to a selected claim. | It may only summarize configured evidence metadata; it must never expand the reader, rows, expiry, or revocation scope. |

The v1 feature should **not** ingest arbitrary PDFs, screenshots, email threads, web pages, RMM/PSA data, or customer exports into an LLM. A raw-document ingestion or retrieval system introduces indirect prompt injection and sensitive-data exposure paths. OWASP explicitly notes that external content, including files, can manipulate model behavior and that retrieval and fine-tuning do not fully mitigate that risk. [2] It also identifies PII, confidential business material, credentials, and legal documents as sensitive information that may be exposed through LLM application outputs. [3]

## Required architecture before any implementation

> **Principle:** The model produces a constrained draft; deterministic code, tenant authorization, and a human approval action control what becomes a report.

| Layer | Required implementation | Explicitly prohibited |
| --- | --- | --- |
| Invocation | Server-side route only; verified session; CSRF; tenant/role check; rate and cost limit; idempotency key. | Browser-held model API keys or direct browser-to-model calls. |
| Input selection | Server retrieves only the current tenant’s named, user-selected, approved report manifest fields. | Whole-database access, arbitrary report-ID access, uploaded-file retrieval, cross-tenant context, or background web browsing. |
| Data minimization | Send only necessary structured fields; redact/mask prohibited categories before provider transmission; record the exact provider/region/retention contract. | “Send the PDF and ask AI to figure it out,” hidden secondary use, or undefined training/retention terms. |
| Model interaction | Fixed task instructions; no model tools; strict JSON-schema response; maximum input/output sizes; safe timeout and retry policy. | Free-form tool execution, database writes, network actions, publish/share actions, or unrestricted output. |
| Validation | Parse the response against a narrow schema, allowlist referenced manifest IDs, escape/validate all rendered text and template properties, reject unsupported fields. | Rendering model-generated HTML/JS/PDF actions directly or treating prose as an authority source. |
| Human review | Side-by-side source, draft, diff, and explicit **Approve** action; reviewer identity and timestamp recorded. | Auto-publish, auto-share, auto-approve, or silent replacement of approved report claims. |
| Audit | Immutable event records for request intent, minimal/hashed input reference, provider/model/version, output hash, validation result, reviewer, and final publication linkage. | Storing raw sensitive prompts or model outputs without a defined retention, deletion, and access policy. |
| Governance | Provider due diligence, privacy/DPA review, data-flow disclosure, customer opt-in/authorization decision, support runbook, adversarial test plan, and release gate. | Marketing the feature as secure, compliant, private, or ready before those facts are true. |

This approach follows the NIST Generative AI Profile’s purpose: incorporate trustworthiness considerations through the generative-AI design, development, use, and evaluation lifecycle. [1] It also directly applies OWASP’s recommended constraints: expected output formats, deterministic validation, least privilege, separation of untrusted content, and human approval for high-risk actions. [2]

## Production prerequisites

RipoDoc should not enable the AI studio on the current public deployment. It must first satisfy the following release gate.

| Gate | Why it is a hard prerequisite |
| --- | --- |
| Durable PostgreSQL, session, audit, and tenant data configuration | The dashboard must have a real, private tenant boundary before it can safely assemble any AI input. |
| Verified email ownership, CAPTCHA/rate limits, and operator support process | Prevents anonymous or automated cost abuse and establishes accountable workspace ownership. |
| Private worker and authenticated authoring preflight | AI must not bypass the report/proposal/review/publish sequence that RipoDoc already uses for protected PDF creation. |
| Provider contract and data-flow approval | The business must decide provider, processing region, retention, training use, subprocessor terms, DPA/privacy consequences, and customer authorization. The current legal pages explicitly state that these decisions remain pending. |
| AI threat model and adversarial test suite | The feature needs tests for prompt injection, cross-tenant access, sensitive-data detection/redaction, malformed structured output, cost abuse, audit completeness, and attempts to publish without a human approval. |
| User-visible data-use disclosure and control | Users need a clear statement of what is transmitted to the model, why, to whom, whether it is retained or used for training, and how the assistance can be disabled. |

## Recommended delivery order

The correct order is intentionally conservative because RipoDoc’s differentiator is controlled evidence delivery, not generic AI generation.

1. **Finish production workspace readiness.** Configure and validate the durable hosted identity, email, CAPTCHA, audit, database, and private-worker requirements. Keep the current public hosted workspace fail-closed until then.
2. **Add dashboard access hygiene.** Mark login, sign-up, password recovery, dashboard, upload, admin, and tokenized evidence routes `noindex`; leave public marketing, demo, method, readiness, security, download, legal, sitemap, and `llms.txt` open to discovery.
3. **Ship the AI Report Studio design without an LLM call.** Add a reviewable client-brand/template preference model and a preview/diff workflow using deterministic settings. This provides immediate PDF customization value with no new AI data flow.
4. **Add a synthetic-data AI pilot.** Use an approved provider only after the gates above; permit draft summaries and bounded style proposals from synthetic, tenant-scoped fixtures; observe output quality, latency, costs, abuse defenses, and audit records.
5. **Offer production AI only as opt-in.** Require a customer/tenant choice, provider/data-use transparency, preflight success, and mandatory human review. Do not enable it for healthcare/PHI/ePHI contexts without the appropriate separate legal, provider, infrastructure, and risk approvals.

## Bottom line

The product should have login and a post-login dashboard. It already has the core route and code-level tenant boundary, but it is correctly fail-closed in the live hosted environment. AI-assisted PDF customization is a promising paid workflow **only if it augments the existing manifest → placement proposal → human review → publish pipeline**. Its output must remain a constrained, auditable suggestion—never the source of evidence, an authorization decision, or an autonomous publisher.

## References

[1]: https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence "NIST AI 600-1 — Generative Artificial Intelligence Profile"
[2]: https://genai.owasp.org/llmrisk/llm01-prompt-injection/ "OWASP LLM01:2025 — Prompt Injection"
[3]: https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/ "OWASP LLM02:2025 — Sensitive Information Disclosure"
[4]: https://developers.openai.com/api/docs/bots "OpenAI — Overview of OpenAI Crawlers"
[5]: https://developers.google.com/search/docs/fundamentals/how-search-works "Google Search Central — How Google Search works"
