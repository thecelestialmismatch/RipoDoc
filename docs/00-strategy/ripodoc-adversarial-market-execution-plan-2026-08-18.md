# RipoDoc Adversarial Market and Execution Plan

**Date:** 18 August 2026  
**Author:** Manus AI  
**Scope:** United States and Australia; MSP client-report evidence delivery.  
**Decision:** Pursue a controlled paid design-partner programme around a narrow evidence-delivery wedge. Do not expand into a generic QBR, client portal, PSA, RMM, data room, or compliance platform.

> **Brutal verdict:** The market validates that QBR reporting, client portals, strategic vCIO workflow, and secure document sharing are active software categories. It does **not** validate that MSPs will pay for RipoDoc. RipoDoc currently has a coherent technical wedge, a live public method, and no supplied proof of paid usage, repeat use, conversion, retention, or a production-capable hosted environment. The next objective is not feature breadth. It is three paid, repeated-use proofs of the specific report-evidence problem.

## 1. Market boundary and the only claim worth testing

RipoDoc is a controlled evidence-delivery layer for the moment **after** a material claim in an MSP report is questioned. The claim may concern SLA attainment, tickets, patching, backup verification, assets, security, or a business recommendation. The product’s job is to let the report remain concise while providing the smallest reviewed supporting evidence set to the intended reader for a defined period.

The category is deliberately narrower than QBR preparation. ConnectWise, JumpCloud, and IT Glue all position QBRs as recurring executive conversations built from CRM, helpdesk, monitoring, operational, financial, security, and roadmap information.[1] [2] [3] That supports the existence of report-heavy MSP workflows, but it does not prove the discrete follow-up proof problem is frequent or expensive enough to buy separately.

| RipoDoc must prove | RipoDoc must not assume |
| --- | --- |
| A buyer can name a recent material report claim that triggered a question after or outside a QBR. | Every QBR user needs a separate evidence-delivery product. |
| The current response is a manual data chase, screenshot, spreadsheet, overbroad export, or excess portal access. | Broad QBR software is automatically inadequate. |
| A reviewer can approve a smaller evidence set than the current workaround exposes. | A technical control by itself creates willingness to pay. |
| The event repeats across clients and reporting cycles. | One enthusiastic discovery conversation predicts retention. |
| A named economic buyer will pay for the workflow. | Free pilots, demos, or compliments are demand. |

## 2. What competitors make easy—and why that is dangerous

The relevant competition is not one product. It is a stack of substitutes that together make “build a broader platform” a losing move.

| Category | Documented competitor capability | What that means for RipoDoc |
| --- | --- | --- |
| QBR/vCIO automation | ScalePad documents data aggregation across 45+ tools, AI-assisted QBR workflows, standardised decks, recommendations, client actions, and approvals.[4] | Do not build ingestion, dashboards, AI deck generation, or QBR authoring as a response. Those are incumbent-suite problems. |
| Client portal and account planning | CloudRadial documents on-demand reporting, dashboards, policy reporting, planner, and client scoring. Strategy Overview documents QBRs, roadmap, budgets, assets, tickets, Microsoft 365 content, and a white-labelled portal.[5] [6] | RipoDoc wins only when the recipient does **not** need a permanent portal and the claim needs a narrower proof path. |
| Interactive executive QBR | Propel positions interactive strategy meetings, live roadmap adjustment, and executive engagement.[7] | The product should not compete for meeting attention. It should own the post-meeting “show me the evidence” handoff. |
| QBR plus GRC suite | vCIOToolbox publishes QBR pricing from USD 149/month for five active clients and bundles collaboration, recommendations, roadmaps, reports, portals, integrations, and GRC modules.[8] | This is a visible price and breadth anchor. RipoDoc cannot justify a premium through a prettier report or generic compliance language. |
| Secure document sharing | DocSend publishes monthly plans from USD 10/user to USD 180/month and includes sharing controls, visitor authentication, allow/block lists, watermarks, gating, revocation-adjacent controls, and audit/data-room views on higher plans.[9] | Generic link security is a substitute. RipoDoc needs report-claim context, source/reviewer facts, and a faster operating workflow—not a feature-for-feature data room clone. |
| Compliance evidence and trust operations | Vanta documents broad control evidence collection, policies, monitoring, risk, reporting, trust-center, and access-control workflows.[10] | Do not rebrand RipoDoc as a compliance platform. Its evidence is client-report evidence, not framework certification or audit-readiness automation. |

**Strategic consequence:** RipoDoc’s differentiation is neither “secure links” nor “QBR software.” It is **a reviewed, claim-specific, reader-bounded proof handoff connected to an already-existing client report**. If a prospect needs broad ongoing self-service, RipoDoc should recommend their portal. If they need generic document security, a data-room product may be better. A refusal to over-sell is part of the product.

## 3. Current position: strengths, gaps, and failure modes

### Strengths worth preserving

The public product is unusually disciplined. It distinguishes a selected claim, reviewed source, smallest useful scope, named reader, and accountable reviewer. It explicitly disclaims generic portal, arbitrary-PDF extraction, automated authority, compliance certification, and public customer-data collection. The recipient proof view, recipient-bound HMAC access, expiry, revocation, audit-before-render ordering, immutable manifests, tenant-scoped operations console, and fail-closed production posture create a credible technical base for a controlled proof workflow.

### Gaps that block commercial success

| Priority | Gap | Why the buyer cares | Required response |
| --- | --- | --- | --- |
| P0 | No real production-capable customer environment | A buyer cannot safely run a paid workflow while PostgreSQL, private worker, email, CAPTCHA, durable audit, backup, incident, and owner responsibilities are unconfigured. | Complete the production checklist and prove a controlled end-to-end environment before accepting customer data. |
| P0 | No paid or repeat-use evidence | The narrow wedge is still a hypothesis. | Run the design-partner programme and require a second report cycle before expanding. |
| P0 | No operator-facing **Evidence Delivery Receipt** | A buyer needs a durable, shareable operational record of what report/version/claim was delivered, under what policy, to what recipient-safe reference, with expiry, revocation, and access outcome. Existing proof brief and audit summary are close but not a clearly named receipt. | Implement a manifest-derived, tenant-scoped receipt view; do not add new customer data or turn it into a generic document tracker. |
| P1 | Delivery lifecycle is incomplete | Secure-sharing substitutes set expectations for reissue, revocation confirmation, policy, and delivery-state visibility. | Add a tenant-scoped delivery-policy and hold-to-confirm revocation flow only after pilot evidence defines the correct lifecycle. |
| P1 | CRM outbox lacks background replay | Sales operations can miss follow-up after a transient CRM failure. | Build an idempotent, bounded retry worker with observability after core product activation; never make CRM success control the prospect form response. |
| P1 | No price evidence | No public RipoDoc price, pilot conversion evidence, or buyer threshold has been supplied. | Test price in paid pilots; do not put a broad public price card on a product whose initial packaging is unproven. |
| P2 | No validated source connectors | Manual manifest/source mapping may create enough friction to prevent repeat use. | Build only the first connector requested by at least three paid pilots with the same authoritative source, approval owner, refresh expectation, and failure owner. |

## 4. Ideal customer profile and anti-ICP

The first ICP is an MSP that already runs recurring executive-facing client reports or QBRs, has a named vCIO/account-management/service-delivery owner, manages material operational or security metrics, and can point to a recent question that forced a broader-than-needed response. The account needs a buyer who controls both reporting workflow and a modest software spend.

The anti-ICP is equally important. Do not target MSPs without recurring client reports, MSPs that need a full client portal, buyers seeking automatic compliance certification, prospects asking to upload arbitrary client reports into the public demonstration, or teams that cannot name a reviewer and source of record. Those prospects are poor fits even if they appreciate the demo.

The U.S. SBA reports 36,186,089 small businesses, and the ABS reports 2,814,778 actively trading Australian businesses; neither is an MSP count and neither is a RipoDoc TAM.[11] [12] Treat these only as evidence that broad business counts cannot justify a market-size claim. RipoDoc’s buyer universe must be built from verified MSP accounts, not from a headline managed-services market report.

## 5. Aggressive design-partner programme

The first programme is **15 founder interviews, 10 carefully reviewed U.S. outbound accounts, five qualified design-partner offers, and a goal of three paid pilots**. Hold Australian commercial outreach until per-recipient consent and sender requirements are defensible under the applicable Australian rules.[13] [14]

### Discovery script: one event, not a generic demo

Ask each prospect to describe the last time a client challenged a report claim. Capture the report type, the exact claim, source system, current answer path, who approves evidence, who needs to read it, whether a broad export/portal was granted, how long it took, and whether the incident is likely to recur. Do not ask for customer reports, credentials, client identifiers, PHI/ePHI, or production exports by email or through the public website.

| Stage | Gate | Success evidence | Stop or pivot condition |
| --- | --- | --- | --- |
| 15 interviews | 8 prospects describe a recurring report-trust incident | 53.3% problem-frequency threshold | Fewer than 8: reposition the job-to-be-done before product expansion. |
| 5 offers | 5 prospects meet ICP and agree a defined proof use case | A named claim, source, reviewer, reader, and owner exist | No defined event: do not give away an undefined “pilot.” |
| 3 paid pilots | 3 of 5 qualified offers pay | 60.0% qualified-offer conversion threshold | Fewer than 3: test packaging/price/ICP; do not build connectors. |
| Repeat use | 3 paid pilots use it in a second reporting cycle | Same buyer returns for a second meaningful claim | One-off use only: the workflow may be a feature, not a company. |

The thresholds above are decision rules, not predictions. The accompanying calculation model shows that three paid pilots yield USD 750, USD 1,500, or USD 3,000 monthly recurring revenue at USD 250, USD 500, or USD 1,000 monthly pilot prices; five paid pilots yield USD 1,250, USD 2,500, or USD 5,000 respectively. These are price-test scenarios, not a revenue forecast.

### Price testing

Test price **after** a prospect confirms the specific report event. Offer the same narrow package with different prices across comparable accounts: USD 250, USD 500, and USD 1,000 per MSP per month, with a written scope, termination right, and manual founder support. The purpose is not to maximise first-month MRR. It is to find whether the problem clears a meaningful payment threshold relative to broad QBR software from USD 149/month and generic secure sharing from USD 10–180/month.[8] [9]

A paid pilot package must name: the report types, maximum active client-report instances, what RipoDoc does and does not ingest, source/reviewer duties, required production boundary, support contact, data-treatment terms, success metric, review date, and termination process. Do not offer unlimited use, unspecified custom integrations, compliance certification, or a free “trial” that hides non-demand.

## 6. Product sequence: what to build and what to refuse

### Implement now

1. **Evidence Delivery Receipt.** Build a tenant-scoped, manifest-derived operator view containing report ID/version/title, selected claim/element reference, source declaration and capture time, reviewer and approval time, recipient-safe reference, delivery condition, expiry, status, and durable access summary where configured. It must never expose raw recipient email, token, evidence rows, or one tenant’s report to another tenant.
2. **Receipt-first pilot workflow.** Put the receipt in the operator console and link it from the existing proof handoff. It must explain the boundary and state that it records delivery posture, not a compliance verdict or proof of recipient comprehension.
3. **Pilot evidence instrumentation.** Add only privacy-safe, tenant-scoped indicators needed to answer: which reports are proof-ready, which receipts have delivery events, which declared readiness fact is missing, and whether a report was reused. Do not add behavioural surveillance or customer analytics unrelated to delivery.
4. **Production activation.** Complete real configuration, backup/restore, controlled end-to-end smoke tests, ownership, and incident response before customer data enters the system.

### Build only after evidence

| Future capability | Trigger | Never do this |
| --- | --- | --- |
| Delivery policy and hold-to-confirm revocation | Three paid pilots name the same approval/expiry/reissue confusion | Do not implement a generic policy engine before real workflow evidence. |
| Signed zero-evidence webhooks | Three paid pilots require the same state-change event to a named system | Do not send evidence rows, tokens, recipient records, or broad CRM data. |
| Source connector | Three paid pilots request the same authoritative system and owner pattern | Do not ingest every PSA/RMM/BI platform “because integrations.” |
| Watermark/view-only policy | A paid buyer names a concrete forwarding/leak deterrence requirement | Do not claim browser controls prevent screenshots or copying. |
| CRM retry worker | Real CRM outbox failures create operational risk | Do not make sales-CRM availability gate evidence delivery or lead acknowledgement. |

### Do not build

Do not build generic QBR authoring, an AI report generator, a full client portal, a data room, an MSP CRM, a PSA/RMM, a compliance certification engine, a chat-with-everything feature, bulk report ingestion, or broad customer-data analytics. Each would move RipoDoc into a competitor’s core territory while erasing the evidence-delivery wedge.

## 7. Operational and commercial requirements before any broad launch

A broad launch remains a **no** until the production preflight is green in a real deployment, a private worker is reachable only through the trusted server path, durable audit storage and backup/restore are proven, user/email/CAPTCHA workflows are tested, security and incident owners are named, commercial/legal documents are finalised, and three paid pilots have demonstrated repeated use.

For U.S. commercial email, use accurate sender/header/subject information, a valid physical address, a clear opt-out route, and timely suppression handling; the FTC guidance states CAN-SPAM applies to B2B commercial email.[13] For Australia, do not send commercial messages unless the required consent basis is documented; the ACMA states that the sender must be able to prove consent and must provide correct sender/contact details and an unsubscribe option.[14] This is operational guidance, not legal advice; qualified counsel must approve final outreach and commercial terms.

## 8. 90-day operating cadence

| Period | Objective | Deliverable | Kill criterion |
| --- | --- | --- | --- |
| Days 1–14 | Activate controlled production and run discovery | Green production preflight, smoke-test record, 15 interview notes, 10 reviewed U.S. targets | If production remains unready, do discovery only; do not accept customer data. |
| Days 15–30 | Convert defined pain into paid pilots | Five scoped offers, price-test log, signed pilot scope | If pain cannot be named or paid, reposition. |
| Days 31–60 | Deliver the narrow workflow | Evidence Delivery Receipt, pilot onboarding, weekly workflow review | If pilots use broad portal/export instead, diagnose why before adding features. |
| Days 61–90 | Prove repeat use or stop | Second-cycle usage data, buyer decision, connector/policy demand log | If fewer than three paid pilots repeat, stop feature expansion and revisit ICP or job. |

## 9. Decision record

**Current release decision:** Implement the Evidence Delivery Receipt and its narrow operator/pilot workflow. Preserve all existing least-data, recipient-bound, audit-before-render, tenant-scoped, and fail-closed controls. Do not implement payments, generic platforms, or speculative integrations.

**Owner decisions still required:** legal entity/sender identity, commercial terms, pricing/currency/accounting treatment, production host and operator, secret management, support owner, incident owner, customer data retention, pilot contract, and whether any Australian target has a valid documented email-consent basis.

## References

[1]: https://www.connectwise.com/blog/8-best-practices-for-client-qbrs "ConnectWise — 8 best practices for client QBRs"
[2]: https://jumpcloud.com/blog/msp-quarterly-review-guide "JumpCloud — MSP Quarterly Business Review Guide"
[3]: https://www.itglue.com/resources/qbr-checklist-for-msps/ "IT Glue — A practical QBR checklist for MSPs"
[4]: https://www.scalepad.com/qbr-software-for-msps "ScalePad Lifecycle Manager — QBR software for MSPs"
[5]: https://www.cloudradial.com/qbr "CloudRadial — On-Demand QBRs"
[6]: https://www.strategyoverview.com/ "Strategy Overview — vCIO/QBR software"
[7]: https://www.propelyourmsp.com/ "Propel Your MSP — vCIO/QBR platform"
[8]: https://vciotoolbox.com/vciotoolbox-platform-pricing/ "vCIOToolbox — Pricing"
[9]: https://www.docsend.com/pricing/ "DocSend — Plans and Pricing"
[10]: https://www.vanta.com/pricing "Vanta — Pricing and product scope"
[11]: https://advocacy.sba.gov/wp-content/uploads/2025/06/United_States_2025-State-Profile.pdf "U.S. Small Business Administration — 2025 Small Business Profile"
[12]: https://www.abs.gov.au/statistics/economy/business-indicators/counts-australian-businesses-including-entries-and-exits/latest-release "Australian Bureau of Statistics — Counts of Australian Businesses"
[13]: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business "Federal Trade Commission — CAN-SPAM Act compliance guide"
[14]: https://www.acma.gov.au/avoid-sending-spam "Australian Communications and Media Authority — Avoid sending spam"
