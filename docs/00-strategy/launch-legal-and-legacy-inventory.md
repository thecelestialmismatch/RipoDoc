# RipoDoc Launch Legal and Legacy Inventory

**Status:** Working launch-control record — not a legal policy.
**Prepared:** 2026-08-13
**Purpose:** This document separates verified implementation facts from legal and commercial decisions that have not been supplied. It prevents the public site from publishing invented contractual commitments.

> **Launch rule:** RipoDoc must not present Terms, a Privacy Policy, a Cookie Policy, a Refund/Cancellation Policy, an SLA, a DPA, an entity name, a governing-law clause, a retention promise, or a support commitment as final until the accountable business owner supplies the corresponding facts and qualified counsel reviews the jurisdiction-specific draft.

## 1. Current launch assessment

| Area | Verified status | Launch implication |
|---|---|---|
| Public website | `www.ripodoc.com` is live on Vercel and serves the current public product, security, self-hosted, and founding-partner pages. | A public legal hub and correctly linked policies are currently missing. |
| Hosted account and prospect intake | The safe health response reports `auth: not-configured`; durable identity, email, CAPTCHA, durable audit, private worker, and founding-partner intake readiness are all false in the observed production environment. | The application is correctly fail-closed. Do not represent hosted accounts or contact intake as operational until production preflight passes. |
| Customer processing architecture | The source supports a Next.js web application, PostgreSQL-backed identity and evidence metadata, an optional private authoring worker, Resend email delivery, and Cloudflare Turnstile verification. | The public privacy notice must describe the actual configured deployment, not every optional/self-hosted code path as though it were active. |
| Commercial terms | No legal entity, registered address, jurisdiction, price, billing system, tax treatment, cancellation rule, refund approach, SLA target, support target, or service-credit model appears in the reviewed tracked material. | These facts must be supplied before any contractual policy is published. |
| Policy pages | No tracked privacy, cookie, terms, refund, SLA, DPA, or legal-notice page exists. | The website is not legally launch-complete. |
| Consent management | No third-party analytics or advertising SDK import is present in the reviewed frontend source. Security cookies are issued by the application. | A Cookie Policy is still required; whether a consent banner is required depends on the final deployment, jurisdiction, and non-essential technologies. |

## 2. Verified application data map

| Activity | Data categories visible in source | Persistence / recipient | Verified implementation boundary |
|---|---|---|---|
| Workspace signup and login | Name, email address, password-derived scrypt hash, privacy-hashed IP, privacy-hashed user-agent, session hash, one-time token hash, role, tenant ID, security event outcome. | PostgreSQL when database configuration is enabled. Verification email is sent through Resend when configured. | `web/frontend/src/lib/auth/service.ts`, `web/frontend/src/lib/auth/email.ts` |
| Password reset and email verification | Email address, one-time code in email body, HMAC-hashed code, privacy-hashed IP, audit outcome. | PostgreSQL and Resend when configured. Raw codes are not put in URLs. | `web/frontend/src/lib/auth/service.ts`, `web/frontend/src/lib/auth/email.ts` |
| Recipient proof for report evidence | Intended-recipient email and one-time code, recipient hash, evidence-link claim metadata, access result. | PostgreSQL/selected audit sink and Resend when configured. | `web/frontend/src/lib/evidence/recipient-proof.ts`, `web/frontend/src/lib/evidence/audit.ts` |
| Founding-partner diagnostic | Contact name, company name, email, company-size band, reporting-tool band, hosting-interest band, source, privacy-hashed IP and email. | PostgreSQL only when the dedicated AES-GCM lead key and production preflight are configured. The contact email is encrypted at rest. | `web/frontend/src/lib/founder/leads.ts`, `web/frontend/src/lib/founder/lead-crypto.ts` |
| Report evidence | Approved evidence rows, provenance, report/recipient metadata, PDF and manifest data. | Self-hosted/local content root or configured worker and database paths, depending on deployment. | `web/frontend/src/lib/evidence/`, `docker/local/server.mjs` |
| Anti-automation | Turnstile token and requesting IP address. | Cloudflare Turnstile verification endpoint only when configured in production. | `web/frontend/src/lib/auth/captcha.ts` |

## 3. Verified cookie and browser-storage facts

| Cookie / storage | Purpose | Key attributes visible in source | Legal classification still requiring jurisdiction review |
|---|---|---|---|
| `ripodoc_session` | Authenticated session. | `HttpOnly`, `SameSite=Strict`, `Secure` in production, path `/`, eight-hour maximum age. | Strictly necessary authentication cookie. |
| `ripodoc_csrf` | Double-submit CSRF defense for state-changing same-origin requests. | `SameSite=Strict`, `Secure` in production, path `/`, one-hour maximum age; readable by the form client because it is compared with submitted token. | Strictly necessary security cookie. |
| Third-party analytics / advertising cookies | None identified from reviewed frontend package imports or source imports. | No verified runtime analytics configuration. | Reassess before adding Vercel Analytics, tag managers, advertising pixels, session replay, A/B testing, or support chat. |

## 4. Subprocessor and deployment facts

| Provider / component | What source confirms | What is still unknown and must not be asserted publicly |
|---|---|---|
| Vercel | The public Next.js application is deployed on Vercel. | Customer contract, storage/processing region, log retention, and enabled Vercel products. |
| PostgreSQL provider | The application requires PostgreSQL for durable hosted identity and optional durable audit / lead records. | Provider, region, backups, encryption posture, access controls, and retention settings. |
| Resend | The code posts email recipient address, subject, and text body to `https://api.resend.com/emails` when configured. | Account owner, region, retention, suppression-list policy, and DPA terms in use. |
| Cloudflare Turnstile | The code submits a token and remote IP to the Turnstile verification endpoint when configured. | Account owner, region, data-processing configuration, and any additional Cloudflare services enabled. |
| Self-hosted MSP operator | The operator may run PostgreSQL, reverse proxy, storage, backups, email service, and the private worker. | The customer-specific deployment, contractual role allocation, and subprocessor list. |

## 5. Mandatory business facts before policies can be published

| Policy / document | Missing facts that the business owner must provide |
|---|---|
| Legal notice and Terms of Service | Legal entity, trading name, registration number, registered address, contact email, B2B/consumer scope, governing law, venue, age restriction, acceptable use, IP/license model, warranty posture, liability cap, indemnity model, suspension/termination rules. |
| Privacy Policy | Controller identity, privacy contact, countries targeted, lawful bases, data-hosting region, complete subprocessor list, retention/deletion periods, data-subject request channel, cross-border transfer mechanism, and whether customer data is used for product improvement or model training. |
| Cookie Policy | Jurisdictions targeted, final cookie inventory, Vercel products enabled, analytics/advertising/chat tools, consent-management decision, and withdrawal mechanism. |
| Refund/Cancellation Policy | Price, currency, billing cadence, payment processor, trial, cancellation cutoff, renewal behavior, taxes, refund exceptions, statutory consumer-rights handling, and authorized refund discretion. |
| SLA | Covered paid plan(s), uptime target, measurement window, exclusions, maintenance notice, support hours and timezone, severity definitions, response targets, service credits, cap, and claim process. |
| DPA / Security Addendum | Controller/processor allocation, customer instructions, permitted subprocessor chain, breach notification target, audit rights, deletion/return commitment, transfer terms, and security schedule. |

## 6. Legacy-code and artifact review

| Candidate | Evidence | Decision | Safe next action |
|---|---|---|---|
| `cmd/api/**` and `go.mod` | Last changed in the 2026-08-06 Go-backend scaffold commit. Current Node/Next.js runtime scripts, Dockerfiles, Vercel deployment, migrations, tests, and web routes do not invoke Go. The Go entry point references a separate WorkOS-based architecture. | **Confirmed obsolete parallel runtime candidate.** | Remove only together with its stale implementation-plan references after a focused cleanup commit and full Node release gate. Do not delete database migrations that the current Node runtime uses. |
| `implementation_plan.md` | Documents a planned Go/WorkOS/Stripe system that is not the deployed Node architecture and includes capabilities not implemented in the current product. Other historical research documents cite it. | **Historical planning artifact; misleading if presented as current product documentation.** | Replace cited current-state assertions with current architecture documents, move essential history into a labelled archive or remove it in the cleanup commit. |
| `IDEA.md` | Still cited by current market and product research. It contains historical hypotheses and pricing assumptions. | **Not unused; contains research provenance.** | Retain but mark it historical/provisional; do not treat it as live commercial terms. |
| `var/*_deck` and security decks | Tracked presentation projects used as sales/security collateral. Some contain old hypothetical pricing or outcome claims. | **Not runtime code, but public-claim risk.** | Retain as internal collateral only until each claim has evidence and the deck is re-reviewed. |
| Standalone legacy logo JPEGs | No verified runtime import; the live application uses `web/frontend/public/ripodoc-mark.png`. Historical docs cite some of the image names. | **Likely obsolete brand-source candidates.** | Confirm no external distribution dependency, update historical references, then remove in a dedicated asset-cleanup commit. |
| Unused frontend dependencies | Reviewed source imports only `lucide-react`, `next`, `pg`, and `react` / `react-dom` from the declared runtime dependency list. | **Confirmed dependency-cleanup candidates pending package-lock update.** | Remove unused Radix, animation, upload/PDF/chart, class utility, and ID packages only after a lockfile update and full production build/audit. |

## 7. Non-negotiable launch blockers

1. The business owner has not supplied the legal identity, governing jurisdiction, commercial terms, refund decision, SLA commitments, or complete privacy/subprocessor facts.
2. The public Vercel deployment is intentionally not configured for hosted identity, private worker, durable audit, email, production CAPTCHA, or prospect intake. Its safe health endpoint reports the incomplete state.
3. A legal hub alone cannot cure missing operational facts. Publishing fabricated retention, uptime, refund, or jurisdiction terms would create a worse launch risk than showing a clear pre-launch state.
4. The Go/WorkOS scaffold and its implementation plan should be removed or clearly archived in the next cleanup release, after documentation references are updated and the Node release gate passes.

## 8. Required owner decision record

The owner must answer the items in Section 5 in writing before legal documents are published. Until then, legal routes may show a **pre-launch legal information notice** only; they must not imply that a contract or privacy notice is complete.
