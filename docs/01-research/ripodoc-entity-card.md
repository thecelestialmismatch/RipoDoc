# RipoDoc Entity Card

**As of:** 2026-08-13 (Australia/Sydney)
**Purpose:** Source-control the factual basis for the YC-readiness and market-positioning work.

| Field | Current basis | Confidence |
|---|---|---|
| Legal/common name | RipoDoc | Verified from the repository and live domain. |
| Listing status | Private, pre-revenue, validation-stage product. | Verified from `docs/00-strategy/master-plan.md`; no public financing or revenue evidence was supplied. |
| Product category | Secure client-reporting delivery and evidence layer for MSPs. It retains PDF delivery while serving approved, recipient-scoped detail behind a report figure. | Verified from the application, README, and product strategy. |
| Primary buyer | MSP owner, vCIO, account-management lead, or service-delivery lead at an English-first MSP with 20–150 staff and 50+ managed clients. | Inferred ICP documented in the strategy; unvalidated by supplied discovery data. |
| Primary end user | MSP report author/reviewer and their client-side report recipient. | Verified product workflow. |
| Initial geography | US, Canada, UK, Australia, New Zealand; English-first. | Documented intended geography; no customer data validates the ordering. |
| Revenue model | SaaS, with a proposed paid founding-partner offer and later tiered plans. | Proposed only; no verified paid customers or price acceptance. |
| Historical financials | Not available. No ARR, MRR, gross margin, CAC, churn, retention, cohort, or cash-burn data was supplied. | Unknown. |
| Fiscal year-end / reporting currency | Not available. | Unknown. |
| Current hosted deployment | Next.js application on Vercel; latest observed production deployment was ready. Hosted identity is intentionally fail-closed until PostgreSQL, server-only authentication values, canonical origin, Resend, and Turnstile are configured. | Verified from Vercel project readout and repository documentation. |
| Current private authoring boundary | PDF authoring worker is intentionally separate from Vercel/browser access; it accepts tenant-bound, short-lived, single-use server capabilities. | Verified from README and shipped worker design. |
| Existing evidence | 139-test repository verification gate, hardened self-host package, SBOM/security documentation, live proof sample, and public documentation. | Verified in repository and prior production verification. |
| Missing venture evidence | Founder achievements, founder-market fit, active users, paid design partners, first-report activation, completed cycles, time saved, retention, pricing willingness, expansion revenue, and customer references. | Unknown until primary evidence is collected. |

## Research boundary

This entity card deliberately does not infer market size, valuation, expected YC outcome, current traction, security certification, or revenue. Any subsequent analysis must label those facts as sourced, founder-supplied, or unknown.
