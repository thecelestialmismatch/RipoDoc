# RipoDoc Competitive Positioning and Claim Register

**Owner:** Product and founder-led sales
**Last reviewed:** 2026-08-13
**Rule:** A public claim is allowed only if the software, verification artifact, or cited primary source supports it. Unknown customer outcomes must remain unknown until consented evidence exists.

## 1. Competitive reality

RipoDoc does **not** own “click a chart and see data.” Microsoft documents visual-data tables and filtered drillthrough inside Power BI reports, while ScalePad sells ConnectWise-native reporting, drill-down, and Power BI delivery.[1] [2] Narrative MSP-reporting competitors also market native PSA integration, automated delivery, and QBR generation.[3] The credible RipoDoc position is narrower and sharper:

> **RipoDoc is the secure delivery and evidence layer for the PDF an MSP already sends. It binds each approved claim to scoped source detail, a recipient, an expiry, a revocation handle, human approval, and an audit record.**

That combination may be differentiated; it is not yet independently proven to be unique across every competitor. Do not use “only,” “first,” or “no one else” unless a current, documented competitive analysis can support the exact scope of the statement.

## 2. Approved public claims

| Claim | Status | Evidence | Approved language | Where to use |
|---|---|---|---|---|
| Document-shaped delivery | Verified | RipoDoc creates/overlays standard PDF link annotations and ships a live sample. | “Keep the PDF your client already opens.” | Hero, demo, sales calls. |
| Scoped evidence | Verified | Evidence claim design, recipient proof, per-element scope, and live product documentation. | “A figure opens only its approved supporting detail—not a broad customer export.” | Homepage, security page, product tour. |
| Recipient control | Verified | HMAC recipient binding, recipient proof, expiry, and JTI revocation are documented and tested. | “Evidence links are bound to an intended reader, expire, and can be revoked.” | Security, sales security review. |
| Human accountability | Verified | Approval-bound authoring flow and audit-chain implementation. | “A human reviews the evidence before publication.” | Product workflow, buyer conversations. |
| Private authoring boundary | Verified | Browser is not granted direct worker access; server-issued short-lived capabilities protect the private worker. | “Private report processing stays behind your controlled service boundary.” | Self-host/deployment pages. |
| Self-hosted deployment controls | Verified | Hardened Compose configuration, SBOM procedure, runbook, and docs. | “The self-hosted package includes isolated services, hardened runtime defaults, and an operator release gate.” | Download page, technical review. |
| Connected-data truth | Verified as product direction | Product research shows arbitrary PDFs often omit the underlying rows. | “For the strongest evidence trail, start with approved structured source data and deliver it through the PDF your client already uses.” | How-it-works, onboarding. |

## 3. Claims that require a qualifier

| Risky formulation | Why it is risky | Qualified replacement |
|---|---|---|
| “Interactive PDFs” | May imply the data is embedded in the file or that every viewer executes application logic. | “A normal PDF with standard links to a controlled evidence experience.” |
| “AI-powered report creation” | Implies automated truth extraction or publication. | “RipoDoc can work with a structured manifest or overlay workflow; a human approves evidence before publication.” |
| “Works with your reporting stack” | Can imply native integrations that do not exist. | “Start with structured CSV/REST inputs or a reviewed overlay workflow; native integrations are selected from repeated customer demand.” |
| “Secure” | Generic and unsupported without a specific outcome. | “Recipient-bound, expiring, revocable, per-element evidence delivery with a review and audit trail.” |
| “Compliance-ready” | Could be interpreted as a certification or legal assurance. | “Designed to support controlled evidence delivery; operators remain responsible for their own regulatory obligations and deployment controls.” |
| “Tamper-proof” | No software system is universally tamper-proof. | “Hash-chained audit records make alteration, deletion, and reordering detectable during verification.” |
| “Zero-trust” | A broad architecture claim with varying interpretations. | “Least-privilege, verified-session, capability-bound access controls on sensitive paths.” |

## 4. Prohibited claims until independently validated

| Do not say | Reason |
|---|---|
| “AI extracts the exact data behind any PDF chart.” | The underlying rows are often not present in a PDF; the claim is technically false for arbitrary reports. |
| “RipoDoc replaces Power BI, BrightGauge, Cognition360, or Handover.” | RipoDoc lacks validated displacement evidence and native integration breadth. |
| “No competitor does this.” | Competitor evidence changes; uniqueness is not independently proven across every market. |
| “Cuts reporting time by 70%.” | This is a testable hypothesis and a proof gate, not current customer evidence. |
| “Used by MSPs” or a customer logo/testimonial without permission. | No validated public customer proof was supplied. |
| “SOC 2 certified,” “ISO certified,” or “compliant with [regulation].” | RipoDoc has control mapping and security documentation, not a supplied certification or customer-specific compliance opinion. |
| “Enterprise-ready” as a standalone phrase. | Needs proven hosted durability, SSO, support, retention, and customer reference evidence. |
| “$X TAM” based on the global MSP-services market. | The global services market is not RipoDoc’s product TAM; use a documented bottom-up model only. |

## 5. Competitive message map

| Buyer situation | Competitor / alternative | What it does well | RipoDoc’s credible angle | Proof needed before claiming a win |
|---|---|---|---|---|
| Internal analytics | Power BI | Visual data tables, drillthrough, dashboards, semantic-model analytics.[1] | The client continues to receive a normal PDF while evidence access is controlled separately by recipient, expiry, revocation, and audit. | Customer confirmation that document-shaped controlled delivery matters. |
| ConnectWise reporting and BI | Cognition360 | ConnectWise-native model, 130+ reports, reporting/drill-down, Power BI delivery.[2] | A client-facing evidence delivery layer that can sit after the reporting output rather than replacing the analytics platform on day one. | Repeated buyer budget/source-of-funds evidence. |
| Narrative QBR/report automation | Handover | PSA-connected narrative reports, scheduled delivery, QBR packs, and PSA push-back claims.[3] | “After the report is sent” controls: scoped, reviewed evidence for disputed or sensitive reported claims. | First design partners must show this solves a persistent QBR/client-trust pain. |
| Unrestricted spreadsheet/email | Manual process | Familiar, low setup cost. | One-figure detail rather than a full-data attachment; recipient gating and revocation preserve least-data delivery. | Evidence that customers value reduced oversharing and better in-meeting response. |
| Generic document tools | PDF/static deck/portal | Narrative delivery and branding. | Evidence is connected to an approved source, recipient control, and review/audit workflow. | Buyer willingness to pay for the control layer. |

## 6. Homepage message hierarchy

**Headline:** “When a client asks where a QBR number came from, answer with proof—not a spreadsheet hunt.”

**Subhead:** “RipoDoc gives the PDF your client already opens a controlled evidence layer: each approved figure can open the exact supporting detail for the intended recipient, with human review, expiry, revocation, and an audit trail.”

**Primary CTA before hosted identity is live:** “See the proof experience.”

**Primary CTA after hosted identity is live:** “Apply as a founding report partner.”

**Secondary CTA:** “Self-host for controlled report processing.”

**Required product truth, directly below the hero:** “Best with approved structured data. RipoDoc does not pretend an arbitrary PDF chart contains source records it never had.”

## 7. Copy review checklist

Before publishing a new claim, the owner confirms the claim has an evidence link, defined scope, current date, and owner. Claims about customer outcomes require customer permission and method notes. Claims about controls must reference an implementation or verification artifact. Claims about competitors must use a dated primary or directly observed source. Any market-size claim must be an auditable buyer × ACV build with assumptions.

## References

[1]: https://learn.microsoft.com/en-us/power-bi/consumer/end-user-show-data "Microsoft Learn — Show data used to create a Power BI visual"
[2]: https://www.scalepad.com/cognition360/pricing "ScalePad Cognition360 pricing and features"
[3]: https://gethandover.uk/msp-reporting-software "Handover MSP reporting software guide"
