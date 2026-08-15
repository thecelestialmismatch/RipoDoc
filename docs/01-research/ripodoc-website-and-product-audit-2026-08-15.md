# RipoDoc Website and Product Readiness Audit

**Reference date:** 2026-08-15
**Sources inspected:** [Homepage](https://www.ripodoc.com/), [For MSPs](https://www.ripodoc.com/for-msps), [Method](https://www.ripodoc.com/how-it-works), [Founding report partners](https://www.ripodoc.com/founding-partners), and the corresponding source route implementation.

## Verified strengths

| Area | Verified finding | Why it helps |
| --- | --- | --- |
| Category clarity | Public pages consistently define RipoDoc as controlled evidence delivery for MSP client reports and explain the “where did that number come from?” moment. | The site has a clear problem wedge rather than a generic reporting pitch. |
| Product boundary | The site clearly says it does not replace PSA/RMM/BI/portal systems, does not perform magic PDF extraction, and does not certify compliance. | Reduces bad-fit expectations and unsupported claims. |
| Demonstrability | The homepage provides an interactive fixture-data report/evidence sample, and the MSP page explains a five-step operating sequence. | Prospects can inspect the concept without submitting data. |
| Trust posture | The site distinguishes fixture data, public demo limits, self-hosted operation, human approval, recipient conditions, expiry, revocation, and fail-closed hosted operation. | The security posture is unusually transparent for an early product. |
| Conversion framing | The founding-partner page asks for a focused report diagnostic, not a vague transformation project. | This matches the product’s narrow wedge and lowers sales-call ambiguity. |

## Verified conversion and readiness blockers

| Blocker | Evidence | Consequence | Priority |
| --- | --- | --- | --- |
| No active hosted lead intake | The founding-partner route calculates `intakeReady` from authentication and encrypted lead-intake configuration. The public page currently tells visitors that secure intake is not yet available and does not collect prospect information. | The principal diagnostic CTA cannot capture a first-customer conversation on the live deployment. | Critical |
| Hosted workspace intentionally fail-closed | Homepage, MSP page, and method page state the hosted workspace remains fail-closed until identity, email, CAPTCHA, audit-storage, and private-worker configuration are present. | The website cannot yet honestly sell a hosted production product; it can sell design partnership and self-hosted evaluation only. | Critical |
| No customer proof | The public pages use fixture data and state transparent boundaries, but do not present a permissioned customer case study, pilot outcome, or third-party validation. | The first purchase must be sold through founder-led evidence rather than social proof. | High |
| No clear commercial offer | The public diagnostic says commercial terms will be defined after fit, but no pilot scope, commercial range, qualification criteria, or buy path is available. | A qualified prospect cannot evaluate the expected commitment or route to a paid decision. | High |
| No active first-customer contact fallback | The unactionable public form routes prospects to sample/self-host pages only. No verified public sales email was supplied for a safe mailto fallback. | Do not invent a contact address; configure durable lead intake or provide a verified contact channel. | Critical |
| Integration proof absent | The product method describes reviewed CSV/REST sources and controlled manifests, but no permissioned live PSA/RMM/BI integration proof is visible. | Prospects may treat the wedge as a concept until one target-system workflow is demonstrated. | High |
| AI assistance not a product | The public site explicitly avoids generic AI claims; the AI dashboard recommendation remains a future workflow with controls. | This is strategically sound for trust, but the roadmap should avoid marketing AI as current capability. | Medium |
| Operator-led deployment burden | The download route provides a complete Compose-oriented self-host path, but requires the operator to configure PostgreSQL, canonical origin, transactional email, CAPTCHA, secrets, TLS edge, audits, and worker network boundaries. | Self-hosting can be a trust advantage, but is not a zero-effort purchasing path for a non-operator MSP. | High |
| Dashboard value needs live use evidence | The authenticated command center supports tenant-scoped report registry, client filtering, reviewed-figure counts, report inspection, and authoring entry points. The hosted runtime is not currently configured for production onboarding. | The product surface is more than a static sample, but it must be validated in a real tenant pilot before it becomes a sales proof point. | High |

## Public conversion recommendation

Until the secure lead-intake production gate is enabled, the primary CTA should not imply that a prospect can request a response through a working form. The honest paths are: inspect the sample, self-host an evaluation, or use a **verified owner-supplied business contact channel**. The durable resolution is to configure the existing secure founding-partner intake prerequisites, test its actual submission, and provide a clear response commitment only after the inbox and lead-storage process are staffed.

## Product sequence recommendation

The immediate product proof is one permissioned, redacted MSP report workflow with a structured source, three chosen claims, a reviewer, a recipient condition, expiry/revocation behavior, and a testable access/audit record. The next work should improve reproducibility for the target source system—not broaden into a general client portal, arbitrary PDF extractor, or autonomous AI reporting tool.
