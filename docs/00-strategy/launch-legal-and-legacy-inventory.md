# RipoDoc Launch-Control and Repository Inventory

**Status:** Current working record as of 2026-08-18. This is an operational inventory, not a legal policy or legal advice.

> **Launch rule:** RipoDoc must not represent draft or status information as final Terms, a Privacy Policy, a Cookie Policy, a Refund/Cancellation Policy, an SLA, a DPA, a legal notice, certification, or a healthcare commitment until the accountable business owner supplies the corresponding facts and qualified counsel reviews the jurisdiction-specific document.

## 1. Current launch position

| Area | Verified status | Launch implication |
| --- | --- | --- |
| Public website | `www.ripodoc.com` is live and presents the public product, security boundary, self-hosting route, founding-partner route, and legal-status hub. | Public discovery and founder-led discovery may continue. |
| Hosted application | The public health surface reports the deployment is intentionally fail-closed until database, identity, canonical origin, email, CAPTCHA, durable audit, private worker, and encrypted founding-partner intake are configured. | Do not represent hosted workspace accounts, report authoring, or paid hosted delivery as operational. |
| Legal hub | Pre-launch legal-status routes exist and explicitly avoid unsupported contractual promises. | These status pages are not customer contracts and do not remove the owner/counsel gates below. |
| Customer-processing architecture | The code supports Next.js, PostgreSQL-backed identity/audit metadata, a private worker, Resend email, Turnstile, and optional isolated EspoCRM lead sync. | Public statements must describe only the deployed configuration, selected vendors, data regions, and approved retention rules. |
| Commercial terms | No verified owner decision records for seller identity, registered address, jurisdiction, price, billing, tax, cancellation, refund, SLA, or service credits are present. | Do not accept paid hosted customers or publish commercial promises until these are decided and reviewed. |
| CRM integration | EspoCRM is an optional one-way connector for explicitly consented founding-partner leads only. | It must remain separate from evidence, recipient, session, report, and audit boundaries. |

## 2. Verified application data and browser-storage map

| Activity | Data categories visible in source | Persistence / recipient | Boundary that must remain true |
| --- | --- | --- | --- |
| Workspace identity | Name, email, scrypt password hash, privacy-hashed IP/user-agent, opaque session/token hashes, role, tenant ID, security outcomes. | PostgreSQL when configured; verification email via Resend. | No raw passwords or one-time values in database, URLs, or logs. |
| Evidence recipient proof | Intended-recipient email and one-time code, recipient hash, evidence-claim metadata, access result. | PostgreSQL/selected audit sink and Resend when configured. | The raw token and broad evidence export remain outside audit/status records. |
| Founding-partner intake | Contact, company, qualification data, source, privacy-hashed IP; consent flag. | PostgreSQL only when the dedicated AES-GCM lead key and preflight are configured. | Contact email remains encrypted at rest; no customer report data is accepted in public marketing forms. |
| Optional CRM lead sync | Expressly consented founding-partner business-contact and qualification fields. | Separate EspoCRM Lead record through outbound HTTPS only. | No report, PDF, evidence, recipient, audit, session, or secret data enters CRM. |
| Essential cookies | `ripodoc_session` and `ripodoc_csrf`. | Browser cookie storage. | Authentication and CSRF cookies remain strictly necessary; non-essential analytics/advertising/replay/chat must not be enabled without a separate review and consent decision. |

## 3. Required owner decisions before paid hosted launch

| Decision | Exact information required |
| --- | --- |
| Seller identity | Legal entity, trading name, registration number, registered address, support/privacy contact, B2B/consumer scope, governing law, venue. |
| Commercial model | Price, currency, billing cadence, tax model, cancellation timing, renewal, refund approach, trial policy, payment processor, and support model. |
| Privacy operation | Controller/processor allocation, target jurisdictions, actual data/subprocessor inventory, storage region, retention/deletion schedule, data-subject request route, transfer terms, and model-training decision. |
| Contract terms | Acceptable use, IP/licence model, warranty posture, liability cap, indemnity, suspension/termination, DPA/security schedule, and required customer commitments. |
| Service operation | Availability target if any, maintenance, support hours/timezone, severity definitions, response targets, incident notification, backup/recovery objective, and service-credit decision. |
| Production architecture | Hosting owner, PostgreSQL provider/region, TLS/reverse proxy, secret store, email sender, CAPTCHA account, worker host/network, monitoring, backup/restore operator, and incident owner. |

## 4. Current repository hygiene findings

| Candidate | Verified finding | Decision |
| --- | --- | --- |
| Go/WorkOS runtime (`cmd/api`, `go.mod`, `implementation_plan.md`) | No such tracked runtime files or live references exist on the current branch. The older inventory was stale. | No deletion is required. |
| Frontend dependencies | Current declared production dependencies are `next`, `react`, `react-dom`, `pg`, and `lucide-react`; the earlier broad unused-dependency claim is stale. | Retain current dependency manifest; keep running production dependency audit. |
| Internal presentation and research projects under `var/` | These are local/internal research or collateral artifacts. Some are not committed; some historical material may contain hypotheses that are not public claims. | Retain until an explicit archival or collateral-review decision; do not publish as current product evidence. |
| Generated audit review images and temporary build artefacts | They are local report-production artefacts, while the user-requested final PDFs and HTML audits are versioned under `docs/01-research/ripodoc-brutal-audit-2026-08-18/`. | Do not add duplicate build artefacts to the repository. |
| Unreferenced public scaffold assets and old public duplicate | Next.js scaffold SVGs, unused `ripodoc-logo.jpeg`, and unused `public/reports/rpt-demo-0001.pdf` had no active code, metadata, documentation, test, or deployment reference; the frontend build passed after removal. | Removed in the current cleanup release. |

## 5. Non-negotiable remaining launch blockers

1. The owner must supply the legal, commercial, and privacy-operation facts in Section 3 before paid hosted launch.
2. Production preflight must pass against a configured database, origin, identity/email/CAPTCHA setup, PostgreSQL audit backend, private worker, and founding-partner encryption key.
3. Backup/restore rehearsal, monitoring, rollback, secret-rotation, and incident-response ownership must exist in the selected production environment.
4. The product needs paid MSP design-partner evidence before broad pricing, ROI, compliance, or market-fit claims are made.
5. Stripe/payment activation remains outside the present work until the owner completes that configuration and its commercial/legal decisions.
