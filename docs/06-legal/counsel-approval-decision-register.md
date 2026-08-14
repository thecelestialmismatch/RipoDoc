# RipoDoc Counsel Approval Decision Register

**Status:** Pre-launch decision register. Not legal advice and not a binding policy.  
**Purpose:** Identify the exact owner-provided facts and counsel decisions needed to convert the public legal-status pages and counsel-review packet into final launch documents.

> **Launch rule:** Do not publish final Terms, Privacy Policy, Cookie Policy, Refund/Cancellation Policy, SLA, DPA, BAA materials, or jurisdiction-specific notices until every applicable row has an accountable owner, evidence, effective date, and qualified-counsel approval.

## 1. Legal entity and contact identity — all fields missing

| Required field | Exact decision or evidence required | Used by |
|---|---|---|
| Contracting entity | Exact registered legal entity name. | Terms, invoices, DPA, SLA, privacy notice. |
| Trading name | Customer-facing business/trading name, if different from the legal entity. | Website footer, Terms, invoices. |
| Registration identifier | Company number, ABN/ACN, EIN, VAT number, or equivalent applicable identifier. | Terms, invoices, tax notices, DPA. |
| Registered address | Full service/registered address permitted for legal notices. | Terms, privacy notice, DPA. |
| Notice address | Email and any postal/address process for contractual notices. | Terms, SLA, DPA. |
| Support contact | Support email and operating escalation channel. | SLA, Terms, customer communications. |
| Privacy/legal contact | Privacy email, legal contact, and DPO/privacy representative where required. | Privacy notice, DSAR process, DPA. |
| Authority record | Named business owner authorized to approve policies and sign customer agreements. | Approval record, internal governance. |

## 2. Jurisdiction, customer class, and market — all fields missing

| Required decision | Exact choice required | Consequence if unresolved |
|---|---|---|
| Customer class | Confirm **B2B-only** or enumerate approved consumer markets/products. | Terms, refund, consumer-rights, cancellation, and notice language cannot be finalized. |
| Target countries/regions | Ranked launch countries/states, including whether the US, UK, EEA, Canada, Australia, and New Zealand are active launch markets. | Privacy notices, transfer, tax, and consumer-law scope cannot be finalized. |
| Governing law | Country and state/territory whose law governs the agreement. | Terms and DPA cannot include a governing-law clause. |
| Venue/forum | Courts, arbitration forum, or other agreed dispute venue. | Dispute clause cannot be completed. |
| Statutory consumer-rights posture | If any consumer use is allowed, identify mandatory cooling-off, withdrawal, refund, and local notice requirements. | B2C launch is blocked. |
| Privacy jurisdiction map | Identify GDPR/UK GDPR, Australian Privacy Act, US state/privacy, Canadian, or other rules assessed as applicable. | Privacy/DSAR/transfer language remains draft. |
| International-transfer mechanism | Approved transfer mechanism and country-specific safeguards, where personal data leaves a regulated jurisdiction. | Final privacy notice and DPA are blocked. |

## 3. Commercial and refund decisions — all fields missing

| Required decision | Exact choice required | Used by |
|---|---|---|
| Commercial offer | Paid product(s), plan names, included units/usage, and self-hosted versus hosted rights. | Terms, checkout, invoices, sales materials. |
| Price and currency | Price, currency, discount/enterprise rules, and whether price is public or quote-only. | Order forms, checkout, invoices, refunds. |
| Billing cadence | Monthly, annual, prepaid, usage-based, or other cadence; invoice due dates. | Terms, order forms, cancellation policy. |
| Payment processor | Processor, merchant-of-record allocation, payout geography, and data roles. | Privacy/subprocessor notice, tax, checkout, refunds. |
| Tax model | VAT/GST/sales-tax registration, inclusive/exclusive pricing, invoicing party, exemption workflow. | Terms, invoices, refunds. |
| Trial/pilot policy | Length, eligibility, conversion, payment requirement, and data/export disposition. | Terms, offer pages, cancellation. |
| Renewal policy | Auto-renewal versus manual renewal, renewal notice, price-change process, and opt-out window. | Terms, invoices, cancellation policy. |
| Cancellation rule | Authorized method, cutoff, end-of-term service behavior, export window, and post-termination deletion. | Refund/cancellation policy, Terms, DPA. |
| Refund policy | Eligibility, calculation, exclusions, discretionary authority, chargeback process, and statutory-rights carve-outs. | Refund/cancellation policy, support runbook. |
| Collections policy | Late-payment grace period, suspension/termination right, collections/fees, and reinstatement. | Terms, invoicing operations. |

## 4. SLA and support commitments — all fields missing

| Required decision | Exact choice required | Used by |
|---|---|---|
| Covered service | Whether the SLA covers hosted application, private worker, self-host bundle, support, or named paid plan only. | SLA scope and exclusions. |
| Availability target | Uptime percentage, measurement period, measurement source, and whether maintenance is excluded. | SLA availability commitment. |
| Maintenance rule | Notice period, window, emergency-maintenance treatment. | SLA and customer communication. |
| Support coverage | Hours, time zone, channels, languages, and named customer contacts. | SLA/support policy. |
| Severity model | Definitions for P1/P2/P3/P4, including customer impact and security incident versus product issue. | SLA and incident procedure. |
| Response/restoration targets | Target initial response, update cadence, target restoration, escalation route by severity. | SLA and support operations. |
| Service credits | Credit calculation, cap, claim deadline, sole-remedy clause, exclusions. | SLA/contract pricing. |
| Customer duties | Browser/network requirements, approved use, support cooperation, self-hosted responsibilities. | SLA, Terms, self-hosted order form. |
| Force majeure/third parties | Treatment of Vercel, email, payment, ISP, customer-controlled/self-hosted dependencies. | SLA exclusions and risk allocation. |

## 5. Privacy, data retention, and subprocessor decisions — all fields missing

| Required decision | Exact choice required | Used by |
|---|---|---|
| Data-controller/processor mapping | Identify roles for RipoDoc, MSP customer, report recipient, and self-hosted operator. | Privacy notice, DPA, healthcare assessment. |
| Hosting region | PostgreSQL provider and region; Vercel region/product; backup/storage region. | Privacy notice, DPA, transfer assessment. |
| Final subprocessor schedule | Vercel products, PostgreSQL host, Resend region, Cloudflare products, monitoring/analytics/support/payment vendors, and self-hosted allocation. | Privacy notice, DPA, procurement. |
| Retention schedule | Account data, session/token data, report/evidence data, recipient data, audit logs, backups, leads, and logs. | Privacy notice, DPA, deletion controls. |
| Deletion/return process | Who initiates deletion, export format/timing, backup expiry, and audit retention exceptions. | DPA, Terms, support runbook. |
| Lawful bases and rights process | Legal bases; verified DSAR identity process; response owner/timeline; complaint contact. | Privacy notice, DPA. |
| Customer-data use | Confirm whether data is used for analytics, product improvement, benchmarking, or model training; define opt-out/consent if any. | Privacy notice, DPA, product controls. |
| Cookie/analytics change control | Provider, fields, purpose, retention, consent/withdrawal design, healthcare exclusion. | Cookie Policy, subprocessor register. |
| Security incident process | Contact, notification thresholds/timelines, evidence preservation, customer communications, and insurer/counsel escalation. | DPA, SLA, healthcare materials. |

## 6. Healthcare Mode B and future PHI/ePHI decision gate — all fields missing

| Required decision | Exact choice required | Current product posture |
|---|---|---|
| Intended healthcare use | Synthetic/de-identified evaluation only, or future PHI/ePHI production use. | **Only restricted evaluation/self-hosted Mode B is permitted today.** |
| Legal roles | Covered entity, business associate, subcontractor, and customer relationship allocation. | Not determined. |
| BAA position | Whether RipoDoc will sign BAAs; approved template; counterparties; conditions; no-BAA rule. | No BAA claim or material is authorized. |
| Risk analysis | Owner, framework, asset/data inventory, threats, safeguards, residual-risk acceptance, review frequency. | Required before PHI/ePHI use. |
| Regulated hosting/subprocessors | Vendor list, regions, contract/BAA evidence, access/audit, backup, recovery, and incident requirements. | Not configured or approved for public hosted PHI/ePHI processing. |
| Data classification/payload policy | Approved fields, prohibited PHI/ePHI fields, redaction/de-identification standard, logging policy. | Public demo, intake, email, analytics, and webhooks prohibit PHI/ePHI. |
| Healthcare integration review | Per-provider signature spec, payload classification, endpoint allowlist, retry/replay handling, BAA/subprocessor review. | No healthcare webhook or connector is enabled. |
| Incident process | Healthcare incident decision tree, contacts, notification assessment, forensics, corrective action. | Required before PHI/ePHI use. |

## 7. Approval workflow

1. The accountable business owner supplies and signs off on every required fact above.
2. Security/privacy owner verifies the data map, vendor schedule, retention implementation, and deployed configuration.
3. Qualified counsel maps the chosen markets, customer class, and transaction model to final documents.
4. Counsel approves final Terms, Privacy Policy, Cookie Policy, Refund/Cancellation Policy, SLA, DPA/Security Addendum, and any BAA/healthcare materials.
5. The approved version receives an effective date, publication version, change-control owner, and archived approval record.
6. The website moves each applicable `/legal/*` route from **pre-launch information** to an approved final document only after the relevant approvals are complete.

## References

[1]: [RipoDoc Counsel-Review Launch Policy Packet](counsel-review-launch-policy-packet.md)
[2]: [RipoDoc Launch Legal and Legacy Inventory](../00-strategy/launch-legal-and-legacy-inventory.md)
[3]: [HHS — HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
[4]: [HHS — Cloud Services and HIPAA Business Associate Agreements](https://www.hhs.gov/hipaa/for-professionals/faq/2075/may-a-hipaa-covered-entity-or-business-associate-use-cloud-service-to-store-or-process-ephi/index.html)

## Legal disclaimer

I am an AI, not a lawyer. This is a working launch-readiness analysis, not formal legal advice; a qualified attorney should review and approve the final documents before use.
