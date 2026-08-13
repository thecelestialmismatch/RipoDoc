# RipoDoc Launch Policy Packet — Counsel Review Required

**Status:** Draft for counsel and accountable business-owner review. **Do not publish as final terms.**
**Version:** 0.1, 2026-08-13
**Applies to:** RipoDoc public website, future hosted workspace, self-hosted package, private authoring worker, and prospective healthcare evaluation mode.

> **Why this packet exists:** RipoDoc can state verified technical facts today, but the accountable business owner has not supplied the legal entity, jurisdiction, commercial plan, payment/refund model, support commitments, data region, retention schedule, or final subprocessor list. These drafts make the missing decisions visible rather than manufacturing legal promises.

## 1. Decision register required for publication

| Decision owner input | Required before publication of final terms |
|---|---|
| Seller identity | Legal entity, trading name, registration number, registered address, support email, privacy/legal contact. |
| Market and law | B2B-only or consumer availability, countries targeted, governing law, venue, statutory consumer-rights treatment. |
| Commerce | Price, currency, taxes, billing cadence, payment processor, trial, renewal, cancellation, refunds, collections. |
| Service commitment | Covered service, uptime target, measurement method, maintenance, support hours/time zone, severity matrix, service credits/cap. |
| Privacy | Controller/processor role, lawful bases, data region, retention, deletion, DSAR contact/process, transfer mechanism, training/analytics use. |
| Subprocessors | Final Vercel products, PostgreSQL provider/region, Resend account/region, Cloudflare products, monitoring/analytics/support vendors, and self-hosted allocation. |
| Healthcare | Intended data type, customer/BA relationship, BAA terms, provider/security review, incident notification, risk-analysis record. |

## 2. Privacy Policy — working draft

### 2.1 Status and scope

RipoDoc will publish a final privacy notice after the decision register is complete and counsel approves the version for the applicable jurisdictions. Until then, the public hosted service is intentionally fail-closed for account creation, customer intake, private authoring, email delivery, durable audit persistence, and healthcare processing.

### 2.2 Verified categories of information

The implemented product can process the following information when its corresponding deployment path is configured: workspace name and email; password-derived scrypt hash; privacy-hashed IP and user-agent values; opaque session and one-time-code hashes; tenant and role identifiers; recipient email and recipient hash for evidence access; approved report/evidence content and provenance; evidence access outcomes; and the founding-partner form’s contact name, company, workflow bands, encrypted email, and privacy hashes. The exact data actually processed depends on whether RipoDoc is used in the public evaluation site, a configured hosted workspace, or a customer-controlled self-hosted deployment.

### 2.3 Verified providers and roles

The source identifies Vercel for the public Next.js application; PostgreSQL for durable identity and optional audit/lead records; Resend for verification, recovery, and recipient-proof email when configured; Cloudflare Turnstile for production anti-automation when configured; and self-hosted MSP operators for their own database, proxy, storage, backups, email provider, and private worker. The final notice must identify the configured provider, legal role, location, retention, transfer, and contractual safeguards rather than treating optional code paths as active subprocessors.

### 2.4 Required final clauses

Counsel must complete controller identity, lawful bases, notices to data subjects, rights/requests process, retention/deletion schedule, international transfer mechanism, security description, subprocessor list, policy-change process, children/minors posture, complaints contact, and whether RipoDoc uses customer data for analytics, service improvement, or model training. Until approved, RipoDoc must not say that it retains data for a particular time or processes data in a particular jurisdiction.

## 3. Cookie Policy — working draft

### 3.1 Current necessary cookies

| Cookie | Verified purpose | Observed attributes | Category |
|---|---|---|---|
| `ripodoc_session` | Authenticated workspace session. | `HttpOnly`, `SameSite=Strict`, production `Secure`, path `/`, maximum age eight hours. | Strictly necessary. |
| `ripodoc_csrf` | Double-submit CSRF protection for same-origin state changes. | `SameSite=Strict`, production `Secure`, path `/`, maximum age one hour. It is form-readable because it is compared to the submitted CSRF value. | Strictly necessary security control. |

### 3.2 Non-essential technology rule

No reviewed frontend source import identifies analytics, advertising, session replay, marketing pixels, tag managers, or support chat. Before enabling any such technology, RipoDoc must: identify the provider and fields; update the cookie/subprocessor register; determine the applicable consent requirement; implement a withdrawal mechanism if required; block healthcare/PHI paths; and obtain legal/privacy approval.

## 4. Terms of Service — working draft outline

The final terms should be B2B-only unless the owner and counsel expressly approve consumer availability. They must define the software/service and any self-hosted license; customer responsibility for source data, report approval, recipient authorization, and self-hosted security; acceptable use and prohibited content; confidentiality; IP ownership/license; suspension and termination; warranty disclaimer; limitation of liability; indemnities; notices; assignments; governing law/venue; and change-control process.

> **Not yet authorized:** seller identity, pricing, payment terms, license scope, warranties, liability cap, indemnity allocation, governing law, venue, and dispute process.

## 5. Refund and Cancellation Policy — working draft outline

The final policy must identify paid plan(s), currency, billing cadence, payment processor, invoice/tax treatment, trial, automatic renewal, cancellation method/cutoff, access/export effect, refund eligibility, exclusions, discretionary handling, and statutory rights. RipoDoc currently has no reviewed hosted checkout or authorized public price, so the public website must not make a refund, cancellation, subscription, credit, or trial promise.

## 6. Service Level Agreement — working draft outline

The final SLA must identify the covered paid service; availability target and measurement source; excluded downtime; maintenance notice; support hours/timezone; severity definitions; response, restore, and escalation targets; service-credit calculation/cap; claims process; customer duties; and force majeure/third-party dependency treatment. Container health checks, production preflight, self-hosted runbooks, and security controls are engineering evidence, not an availability guarantee.

## 7. Data Processing Addendum — working draft outline

A final DPA must state the parties’ controller/processor roles, processing instructions, duration, purpose, data categories, data-subject categories, confidentiality, security measures, approved subprocessors, change notification, audit assistance, incident notification, deletion/return, international transfers, and customer obligations. The DPA must separately allocate responsibility for a self-hosted MSP deployment because the operator can control its own database, email, proxy, backup, storage, worker, and vendor chain.

## 8. Healthcare Mode B statement — approved technical posture, not a certification

Healthcare Mode B is a restricted evaluation and self-hosted posture. It is not HIPAA certification, a business associate agreement, a representation that the public RipoDoc service accepts PHI/ePHI, or a substitute for a covered entity/business associate’s own compliance program.

Mode B prohibits PHI/ePHI in the public demo, public hosted authoring route, founding-partner intake, ordinary email, unapproved analytics, Vercel-hosted webhook payloads, and arbitrary outbound callbacks. Future PHI/ePHI use requires documented risk analysis, legal role review, appropriate contract/BAA where applicable, verified hosting and subprocessor agreements, access/audit controls, retention/deletion controls, incident process, provider-specific payload review, security approval, and counsel approval.

## 9. Approval record

| Artifact | Business-owner approval | Counsel approval | Effective date | Publication path |
|---|---|---|---|---|
| Privacy Policy | Pending | Pending | Pending | `/legal/privacy` |
| Cookie Policy | Pending | Pending | Pending | `/legal/cookies` |
| Terms of Service | Pending | Pending | Pending | `/legal/terms` |
| Refund/Cancellation Policy | Pending | Pending | Pending | `/legal/refunds` |
| SLA | Pending | Pending | Pending | `/legal/sla` |
| DPA / Security Addendum | Pending | Pending | Pending | `/legal/dpa` |
| Healthcare Mode B / BAA materials | Pending | Pending | Pending | `/legal/healthcare-mode-b` |

## References

[1]: [HHS — HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
[2]: [HHS — Cloud services and HIPAA business associate agreements](https://www.hhs.gov/hipaa/for-professionals/faq/2075/may-a-hipaa-covered-entity-or-business-associate-use-cloud-service-to-store-or-process-ephi/index.html)
[3]: [OWASP — Web Service Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Web_Service_Security_Cheat_Sheet.html)
