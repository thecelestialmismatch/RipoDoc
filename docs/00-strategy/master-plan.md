# RipoDoc Master Plan

> **One document to run the company from.** Market, money, product, go-to-market, technology, security, six-month execution, and the anti-failure rules that keep RipoDoc from joining the YC RIP list.
>
> Status: Pre-revenue · Validation phase · Last updated: 2026-07-26
> Companion docs: [`IDEA.md`](../../IDEA.md) (narrative) · [`prd.md`](../02-product/prd.md) · [`market-evidence.md`](../01-research/market-evidence.md) · [`competitor-map.md`](../01-research/competitor-map.md) · [`architecture.md`](../05-engineering/architecture.md) · [`threat-model.md`](../04-security/threat-model.md)

---

## 1. Market Potential — brutal honesty

### 1.1 The verdict

**RipoDoc can be a real $10–$50M ARR business. It is not, today, a proven billion-dollar idea.**

"Click a chart → see the table" is a commodity feature inside BI tools (Power BI, Metabase, MSPBots already ship it). The defensible company is the **trusted client-value and QBR operating system for MSPs**, with interactive evidence-backed reports as the entry point. The losing company is "a PDF viewer with AI chart extraction."

### 1.2 The numbers that matter

| Metric | Value | Tag |
| :--- | :--- | :--- |
| Global MSP services revenue | ~$401B (2025) | SECONDARY — **this is services revenue, NOT RipoDoc's TAM** |
| MSPs delivering managed services globally | ~341,000 | SECONDARY — broad definition (includes VARs/resellers) |
| US MSPs | 40,000+ | SECONDARY |
| UK MSPs | **11,492** | **VERIFIED** (DSIT census) |
| English-speaking core MSP pool | ~60,000–70,000 | DERIVED |
| **Qualifying ICP firms** (20–150 staff, 50+ managed clients) | **~6,000–12,000** | **DERIVED — upper bound** |

> **Never call the $401B RipoDoc's TAM.** Full source breakdown with strength tags: [`market-evidence.md`](../01-research/market-evidence.md).

### 1.3 Bottom-up revenue scenarios

| Outcome | Paying MSPs | Avg Annual Revenue | RipoDoc ARR | Implied share of the ~6–12k ICP pool |
| :--- | ---: | ---: | ---: | :--- |
| Healthy niche SaaS | 200 | $8k | $1.6M | 2–3% |
| Serious vertical company | 1,000 | $12k | $12M | 8–17% |
| Large MSP-platform business | 3,500 | $15k | $52.5M | 29–58% |
| ~~$100M+ outcome~~ | 6,700 | $15k | $100M+ | **56–112% of every qualifying MSP on Earth — deleted** |

**The $100M row is arithmetic that never happens.** A $100M outcome requires either a broader ICP or a higher ACV — say so explicitly rather than hiding it in a customer count.

**Realistic 3-year target:** 1,000 paying MSPs at ~$12k/year = $12M ARR. That is roughly **one in eight of every qualifying MSP worldwide** — a stretch, not a base case.

### 1.4 Why this market is underserved

MSPs currently assemble client reports from 5–12 different tools (PSA, RMM, security, backup, billing). The client receives a static PDF that cannot be clicked, searched, or verified. During the QBR, the client asks *"show me the 14 assets at risk"* and the MSP fumbles.

| Category | Example vendors | The gap RipoDoc fills |
| :--- | :--- | :--- |
| BI dashboards | Power BI, Metabase, Looker | Complex for client executives. No report feel. No narrative. |
| MSP reporting | MSPBots, BrightGauge, Databox | Dashboard-shaped, not document-shaped. Public links not recipient-bound. No review gate. No audit trail. |
| Narrative report automation | Handover, ScalePad Lifecycle Insights | Writes the report. No reader interactivity. No evidence layer. No secure delivery. |
| Interactive documents | Foleon, Ceros, Gamma | Marketing-focused. No data binding to source records. No MSP workflows. No security model. |
| Spreadsheets | Excel, Google Sheets | Insecure to share. No narrative. Version chaos. |

**The gap is real and specific:** BI tools give the reader the rows but are dashboards. Document tools give the narrative but not the rows. **Nobody combines document-shaped, narrative, client-facing reporting with a human review gate, recipient-bound delivery, and an immutable audit trail.** That is the surviving, defensible claim — see §4.

### 1.5 What makes RipoDoc big

1. **Owns the full client-reporting workflow:** ingestion → review → narrative → delivery → proof-of-value → QBR follow-up → renewal evidence.
2. **Substantially faster than a dashboard builder:** a good report in minutes from the MSP's existing tools, not a consultant-built analytics project.
3. **Turns opaque charts into trusted evidence:** approved source data with an audit trail. In an era of AI skepticism, *human-verified* is a feature, not a limitation.
4. **MSP-native templates and marketplace distribution** (Pax8, ConnectWise) after customer proof.

### 1.6 What will kill it (and how to avoid each)

| Killer | Why it kills | The avoidance |
| :--- | :--- | :--- |
| "AI converts any PDF into exact data" as the headline | Arbitrary PDFs often don't contain the underlying data; vision models misread charts. Mandatory review reduces the magic. | Lead with CSV/REST ingestion + human review. PDF overlay is the delivery layer, not the extraction promise. |
| Competing as "another dashboard" | Power BI Embedded already ships customer-facing branded analytics. Existing MSP vendors automate reports. | Position as the secure reporting **delivery and evidence layer** for the tools MSPs already use. |
| Treating integrations as easy | Authentication, customer matching, refresh failures, changing APIs, data-quality disputes are the expensive part. | PDF, CSV, generic REST only for the first 6 months. First direct connector only after 3+ paying customers request the same one. |
| Assuming recipients want exploration | Many executives want a clear narrative and a few answers, not another analytics tool. | The report reads like a PDF. Interactivity is optional but always available. |

### 1.7 The proof gate before major build investment

**Five MSPs pay at least ~$500/month, use RipoDoc for three consecutive client-report cycles, cut report preparation by 70%+, and choose it over their current dashboard/PDF process.**

If that does not happen, it is more likely an add-on feature than a standalone large business. (See §10 anti-failure rules.)

---

## 2. The Money

### 2.1 Bootstrap cost (6 months)

| Item | Amount |
| :--- | ---: |
| Founder living expenses (6 months) | $18,000–$36,000 |
| Infrastructure & tools (6 months) | $3,000–$7,000 |
| Contract frontend/design (2–3 months) | $8,000–$17,000 |
| Pen test + legal (DPA, privacy, terms) | $5,000–$10,000 |
| **Total required** | **$34,000–$70,000** |

### 2.2 Revenue offset

| Milestone | Timeline | Cumulative cash |
| :--- | :--- | ---: |
| 3 founding partners × $1,497 upfront (3 mo @ $499) | Month 1–2 | $4,491 |
| 5 paying customers | Month 3 | $2,495/mo MRR |
| 10 paying customers (blended $499–$799) | Month 6 | $6,500–$7,500/mo MRR |

Bootstrapable if the founder can cover living costs for 6 months. Pre-seed ($150k–$250k) is only warranted **after** 5 paying customers + a clear retention signal.

### 2.3 Pricing — two paths, one decision

The original IDEA.md ladder ($750/$1,250/$2,500) is unsupportable as an **additive** purchase. The verified category ceiling for an MSP-specific reporting tool is **$449/mo** (ScalePad Cognition360 starts at $449 **plus** a Power BI licence per user; Handover charges £49–£99/mo).

| Path | Realistic price | What it requires |
| :--- | :--- | :--- |
| **Additive** (16th–21st vendor in the stack) | Low hundreds/mo | Nothing new. But the $12k ACV in the model dies. |
| **Displacement** (replaces BrightGauge or Cognition360 as a line item) | $400–$1,000+/mo | **PSA/RMM connectors** — deferred until 3+ paying customers request the same one. |

**Recommendation:** run the two-question pricing probe in every discovery call before committing to a ladder:

> 1. *"What do you currently spend on reporting tools per year?"*
> 2. *"If RipoDoc cut your report prep time by 70%, what would you cut to pay for it?"*

**Working ladder (to validate, not to publish):**

| Tier | Price | Includes |
| :--- | ---: | :--- |
| Founding Partner | **$499/mo, 3 months upfront** | 10 customer orgs, onboarding, white label, direct founder support |
| Core | **$799/mo** | 25 active customer orgs, portal, workflow automation |
| Scale | **$1,499+/mo** | Higher volume, SSO, API/embed, advanced controls, priority support |

### 2.4 Unit economics (target)

| Metric | Value |
| :--- | :--- |
| ACV | $6,000–$12,000/year (depending on tier mix) |
| CAC | $1,500–$3,000 (founder-led sales) |
| CAC payback | < 3 months |
| Gross margin | 80%+ |
| NRR | 110%+ (expansion from more customer orgs) |
| Monthly churn target | < 2% |

### 2.5 What we do NOT do

No free tier. No lifetime deals. No per-report pricing. No usage-based pricing in MVP. No marketplace revenue share in the first 12 months.

---

## 3. First 10 Paying Customers

### 3.1 Ideal Customer Profile (ICP)

| Attribute | Requirement |
| :--- | :--- |
| Company type | MSP |
| Staff size | 20–150 employees |
| Managed clients | 50+ |
| Geography | US, Canada, UK, Australia, New Zealand (English-first) |
| Current reporting | Manual PDFs, Power BI, BrightGauge, MSPBots, Excel, or multiple dashboards |
| Dedicated BI team | No |
| Decision maker | Owner, vCIO, account-management lead, or service-delivery lead |
| Pain level | Spends 4+ hours per client per quarter on reports. Has lost a client or renewal due to poor reporting. |

### 3.2 Acquisition funnel

| Stage | Volume |
| :--- | ---: |
| Researched MSP accounts | 400 |
| Contacts (owner, vCIO, service delivery — 3 per account) | 1,200 |
| Replies (4–7%) | 50–80 |
| Discovery calls (60% of replies) | 30 |
| Demos (50% of calls) | 15 |
| **Paid founding partners (67% of demos)** | **10** |

### 3.3 Outreach sequence

| Day | Action | Channel |
| :--- | :--- | :--- |
| 0 | Researched, specific outreach referencing their reporting stack. Offer 20-min report teardown. | Email |
| 3 | Share a 2-min Loom of a dummy RipoDoc report for their industry. | Email |
| 7 | Connect. Comment on their content. No pitch. | LinkedIn |
| 10 | "Still thinking about this?" + one relevant case study/data point. | Email |
| 14 | Break-up: "Closing the loop. Here's the teardown recording if useful later." | Email |

### 3.4 Discovery call structure (20 minutes)

1. **Their current process** (5 min): "Walk me through how you build a QBR for your largest client."
2. **The pain** (5 min): "What happens when the client asks for the data behind a chart?"
3. **The cost** (3 min): "How many hours does your team spend per client per quarter?"
4. **The demo** (5 min): Show a realistic dummy report. Click a chart. Show the table. Show the audit log.
5. **The ask** (2 min): "If this saved you 70% of that time, would it be worth $499/month?"

**Pricing probe (ask in every call):** what they currently spend on reporting tools, and what they'd cut to pay for this.

### 3.5 Demo protocol

- **Never show a generic AI demo.** Show a realistic MSP report with real-looking data (the shipped demo manifest now contains **412 ticket rows** plus the SLA/asset evidence grids — every count is genuinely enumerable).
- **Always click a chart** and show the table drawer — the "aha" moment.
- **Always show the review queue** — "We don't let AI publish. You approve everything."
- **Always show the audit log.**
- **Never promise perfect PDF extraction** — "AI assists. You verify. That's the point."

### 3.6 Closing protocol

- Offer Founding Partner tier: $499/mo, 3 months upfront ($1,497).
- Include: onboarding call, first report built together, 24-month price lock, roadmap input.
- Never: free pilots, discounts, "try it and see," monthly billing for founding partners.
- If they hesitate: "I'm only taking 10 founding partners. I'll keep you posted if a spot opens."

### 3.7 Why customers buy

1. **Time savings.** 6 hours per client per quarter → 2. 200 hours/year across a book.
2. **Client retention.** "I lost a $8k/month client because they said they couldn't see what we were doing."
3. **QBR confidence.** "Show me the data" answered in-meeting, not "I'll email you."
4. **Security.** Stop emailing unrestricted spreadsheets with all their ticket data.
5. **No stack replacement.** "I don't want to rip out ConnectWise. I just want the output to be better."

### 3.8 Why customers decline (and how to handle it)

| Objection | Counter |
| :--- | :--- |
| "Our reporting process works fine." | "How many hours per quarter? What happens when a client disputes a number?" |
| "We already have MSPBots/BrightGauge." | "Can your client click a chart in the PDF and see the rows? Can you revoke access?" |
| "AI extraction is too unreliable." | "We agree. That's why every element goes through a human review queue before publication." |
| "We don't have budget." | Qualify out. Focus on MSPs with 50+ clients. |
| "Our clients don't want interactivity." | "It reads like a PDF. The interactivity is optional — but when they ask 'show me,' it's there." |

---

## 4. What We Do That No One Else Does

### 4.1 The precise claim

> Click-to-evidence is commodity **inside BI tools**. **Nobody delivers it from the PDF an MSP actually emails a client** — where the click survives the export, the email, the forward and the phone.

The interaction: *"You claimed 14 items were achieved. Show me the 14 items."* Click the figure in the PDF. A browser window opens with exactly those 14 rows, the query that produced them, and who approved them.

### 4.2 How it works (and why it works in every viewer)

Every interactive element carries a standard PDF link annotation (`/Annot /Subtype /Link` with a `/URI` action). `https` link annotations are supported in Chrome, Safari, Preview, Acrobat, Firefox, iOS and Android. Embedded PDF JavaScript (the "obvious" alternative) is Acrobat-only and silently fails everywhere else.

**The rows never travel inside the PDF.** Forwarding the file does not forward the data. The link opens a recipient-bound evidence page that is:

- Hashed to one recipient (email is HMAC'd, never embedded)
- Expiring (signed into the token)
- Revocable (per-link `jti` kill switch, no key rotation)
- Version-pinned (a token for v3 cannot open v4)
- Scoped to one element (never the whole report's data)
- Audit-logged on every access — granted or denied

Full spec: [`interaction-spec.md`](../02-product/interaction-spec.md)

### 4.3 The positioning matrix

| | Document-shaped | Reader sees underlying rows | Human review gate | Recipient-bound + revocable | Immutable audit trail | MSP-native |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| MSPBots | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ |
| BrightGauge | ✗ | ~ | ✗ | ~ | ✗ | ✓ |
| Cognition360 | ✗ | ✓ (via Power BI) | ✗ | ~ | ✗ | ✓ |
| Lifecycle Insights | ✓ | ✗ | ✗ | ~ | ✗ | ✓ |
| CloudRadial | ~ portal | ~ | ✗ | ✓ (portal login) | ✗ | ✓ |
| Handover | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Power BI / Metabase | ✗ | ✓ | ✗ | ~ | ✗ | ✗ |
| Foleon | ✓ | ✗ | ✗ | ~ | ✗ | ✗ |
| **RipoDoc (target)** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** |

**Read it honestly:** RipoDoc's uniqueness is **not** any single column. Every column is occupied by someone. It is the **combination** — and specifically the three columns nobody occupies: *human review gate*, *recipient-bound + revocable*, *immutable audit trail*.

### 4.4 The strategic threat: ScalePad, not MSPBots

ScalePad (PE-backed) has already acquired **both the BI layer** (Cognition360, Feb 2023) and **the QBR layer** (Lifecycle Insights, Apr 2023). A well-capitalised consolidator that owns both layers is the most likely party to ship "secure interactive client reporting" as a feature. **That is the competitive clock.**

### 4.5 The Handover warning

Handover (gethandover.uk) ships narrative QBR packs in under 60 seconds on HaloPSA and ConnectWise, at £49–£99/mo. It already occupies the narrative-report position and both marketplaces. **But it has no reader interactivity, no review gate, no secure delivery, no audit trail.** RipoDoc's wedge is *what happens after the report is sent*:

> *"You already automate the report. What happens when your client disagrees with a number in it?"*

---

## 5. Product Requirements (PRD Summary)

### 5.1 Core workflow

1. **Create** — author creates a customer workspace; uploads PDF/CSV or connects a REST data source.
2. **Extract** — RipoDoc processes the upload into structured candidate elements (KPI, chart, table, claim) with confidence scores and page coordinates.
3. **Review** — author enters the review queue; corrects values, attaches source rows, approves or rejects each element. AI proposes, humans approve.
4. **QA** — deterministic checks: do totals reconcile? Are there contradictions? Is every approved element backed by source rows?
5. **Publish** — immutable version frozen. Static PDF companion generated with secure links.
6. **Deliver** — recipient-bound expiring links, portal access, or embedded in the MSP's own app.
7. **Monitor** — who accessed what, which elements were clicked, which data was exported, revocation controls.

### 5.2 MVP capabilities (P0)

- PDF upload + text extraction (native; OCR fallback planned)
- CSV upload + column parsing
- Generic REST API ingestion
- PDF-like report reader with click-to-data drawer
- Author review queue (confidence, correction, approval state)
- Immutable publish + version pinning
- Share links: hashed, expiring, revocable, recipient-bound
- Audit log: hash-chained, append-only, verifiable
- Searchable, sortable, exportable evidence grid (CSV with formula-injection protection)

### 5.3 Explicit exclusions (MVP)

- Perfect extraction of arbitrary PDFs without human review
- Full dashboard builder
- Anonymous public reports
- Write access to CRM/PSA/RMM/billing
- "Interactive PDF works in every viewer" claims
- Native mobile apps
- Customer-facing AI chatbot
- Broad vendor integrations in the first 6 months
- Multi-language support

### 5.4 User roles

| Role | Permissions |
| :--- | :--- |
| Owner | Full tenant admin, billing, all reports |
| Admin | User management, all reports, templates, security settings |
| Author | Create/edit reports, upload sources, review, publish, share |
| Reviewer | Review and approve elements; cannot publish or share |
| Client (Portal) | View published reports, click elements, export if authorized |
| Client (Link) | View a single report via share link, scoped to that report |

---

## 6. AI Agent Strategy — yes, as author assistants

### 6.1 The decision

**Add the five AI agents — but as author assistants, never autonomous decision-makers.**

The reader's experience remains **100% deterministic**. When a client clicks a chart, they see data a human approved before publication. No model runs at view time. No LLM performs arithmetic. No agent decides what a chart means to a reader.

### 6.2 Agent inventory

| Agent | Job | Allowed output |
| :--- | :--- | :--- |
| Extraction | Finds report regions, tables, KPIs, chart candidates | Structured candidate elements with confidence + page coordinates |
| Data-Mapping | Maps CSV/API fields to report visuals and metric definitions | Proposed mappings for author approval |
| Narrative | Drafts executive summaries and QBR commentary | Editable draft with hyperlinked metric sources |
| QA | Reconciles totals, flags missing/contradictory data, detects unusual changes | Pre-publish warnings + review checklist |
| Template | Proposes report structure from approved MSP templates | Draft layout only |

### 6.3 Hard containment rules

- Agents may read **only the current tenant/customer/report context**.
- All outputs are structured, source-linked suggestions — not facts until approved.
- Numerical calculations run through **deterministic SQL/data functions, never LLM arithmetic**.
- Agents **cannot**: publish reports, change access, send emails, export data, alter source systems, or bypass review.
- No customer-facing chat agent in the first 6 months.
- Model provider: DPA, no-training/no-retention terms for customer data, regional processing (AWS Bedrock / Azure OpenAI).
- Test before shipping: prompt injection inside uploaded PDFs, cross-tenant leakage, fabricated-data responses, malicious instructions, incorrect chart interpretation.

### 6.4 Why agents matter for the business

- Extraction agent turns a 30-minute manual upload into 5 minutes of review.
- QA agent catches the unreconciled total before the client does — which is the trust failure RipoDoc exists to prevent.
- Narrative agent drafts the QBR executive summary, cutting the biggest authoring cost.
- All of it feeds the "reports in minutes, not consultant hours" positioning that makes the pricing defensible.

---

## 7. Technology Stack (Pinned)

### 7.1 The stack

| Layer | Technology | Version | Rationale |
| :--- | :--- | :--- | :--- |
| Frontend | Next.js / React / TypeScript / Tailwind | 16.2.12 / 19.2.4 / 5.9 / 4.1 | SSR report reader, App Router, Server Components |
| Backend | Go + chi + pgx + sqlc | 1.24+ / v5.2.1 / v5.7.4 / latest | Concurrency, single binary, security, type-safe SQL |
| Database | PostgreSQL (RLS) | 18.4 | Tenant isolation, JSONB, maturity |
| Background jobs | River | v0.16.2 | PostgreSQL-backed, transactional, no extra infra |
| PDF engine | **Hand-rolled, dependency-free TypeScript** (already shipped) | — | Link annotations + byte-preservation are the trust boundary; must be auditable without a vendor library |
| OCR (planned) | AWS Textract | v2 API | Tables, forms, handwriting; KMS-encrypted processing |
| Auth | WorkOS / AuthKit | latest | SSO/SAML-ready, enterprise-grade |
| Billing | Stripe | v82 Go SDK | Subscriptions, webhooks |
| Infrastructure | AWS ECS Fargate / RDS / S3 / KMS / CloudTrail / WAF | — | Containerised, encrypted, logged |
| CI/CD | GitHub Actions + Trivy + CodeQL + Gitleaks + Dependabot | — | Build, test, scan, deploy |
| IaC | OpenTofu | latest | Infrastructure as code |
| Observability | OpenTelemetry + Sentry + PostHog | — | Tracing, errors, product analytics |

### 7.2 Key architectural decisions

| Decision | Choice | Rationale |
| :--- | :--- | :--- |
| Monolith vs microservices | **Modular monolith** (Go API + isolated worker) | Solo founder. No distributed complexity. |
| PDF engine | Hand-rolled TS, not Go/pdfcpu | The shipped `tools/evidence-pdf` is byte-verified, dependency-free, and the security tests pin it. Port to Go later only if performance demands. |
| Multi-tenancy | Shared DB + PostgreSQL RLS | Simplest secure model. |
| Job queue | River (PostgreSQL) | No separate queue infrastructure. Transactional guarantees. |
| AI | AWS Bedrock / Azure OpenAI | DPA, no-training terms, regional processing. No customer chat in v1. |

### 7.3 What is shipped today vs. planned

| Component | Status |
| :--- | :--- |
| PDF generator with clickable link annotations | ✅ Shipped + 127 tests passing |
| Overlay engine (make an existing PDF clickable, byte-preserving) | ✅ Shipped + verified against a LibreOffice export |
| Hash-chained audit log + verifier | ✅ Shipped |
| Token engine (HMAC-SHA256, expiry, revocation, version pinning) | ✅ Shipped |
| Next.js evidence pages (token-gated, searchable, sortable, CSV export) | ✅ Shipped |
| Demo manifest (412 tickets + SLA + assets, both fixture copies) | ✅ Shipped — every count KPI enumerates its rows |
| Go API (`cmd/api`) | ⏳ Planned |
| Worker service (`cmd/worker`) | ⏳ Planned |
| PostgreSQL RLS + migrations | ⏳ Planned |
| Authoring UI (upload → review → publish) | ⏳ Planned |
| Customer portal + auth | ⏳ Planned |
| Billing (Stripe) | ⏳ Planned |
| AI agents | ⏳ Planned (assist-only) |
| AWS infrastructure + CI/CD | ⏳ Planned |

---

## 8. Security Plan

### 8.1 Non-negotiables

1. No public sharing by default.
2. No AI agent can publish, export, or modify access.
3. All numerical data is deterministic (SQL), never LLM-generated.
4. A customer's document is appended to, never rewritten (overlay preserves the original as a byte-prefix).
5. Every evidence zone is approved by a named person before publication.

### 8.2 Controls

| Layer | Control |
| :--- | :--- |
| Network | AWS WAF, VPC private subnets, no public DB access, TLS 1.2+ |
| Auth | WorkOS (SAML/OIDC), httpOnly secure SameSite=Strict sessions |
| Authorization | RBAC + tenant-scoped queries + PostgreSQL RLS |
| Storage | S3 SSE-KMS, bucket policies, no public access |
| Uploads | Malware scan, sandboxed PDF processing, reject unsupported types, never execute embedded PDF JS |
| Share links | 256-bit tokens, recipient-hash binding, expiry, revocation, rate limiting |
| Audit | Append-only hash chain (`npm run audit:verify` detects any edit/deletion/reorder) |
| Secrets | AWS Secrets Manager, no secrets in code/env/logs |
| CI/CD | Trivy, CodeQL, Gitleaks, Dependabot |
| Compliance | SOC 2 Type 1 ready by Month 6. DPA, privacy policy, terms, pen test before broad launch. |

Full threat model: [`threat-model.md`](../04-security/threat-model.md)

---

## 9. Six-Month Execution Plan

| Period | Product | Sales & validation | **Required gate** (fail = stop) |
| :--- | :--- | :--- | :--- |
| Days 1–14 | PRD finalised; landing page live; demo report built; verify workflow green; master plan complete | 400-account list; 15 discovery calls | 5 prospects confirm the same painful reporting problem |
| Month 1 | Upload flow (PDF+CSV); basic extraction; review queue skeleton; publish + share links | 30 discovery calls; 15 demos | **3 prepaid founding partners ($4,491+ collected)** |
| Month 2 | Review queue complete; click-to-data drawer; audit log; export controls | Onboard 3 partners; build first real report together | Each partner processes a real client report |
| Month 3 | Watermarking; customer portal (basic); AI extraction agent (assist only) | Close 2 more partners; collect testimonials | **5 paying customers** |
| Month 4 | QA agent; narrative agent; template system; bug fixes; performance | Close 2 more partners | 70% of pilots continue after one cycle |
| Month 5 | CSV + generic REST adapters; security hardening; pen test; legal pack | Create 2 reference stories; referral program | No custom code per customer; pen test passed |
| Month 6 | SOC 2 prep; embedded-report beta; API docs | Public launch; content marketing | **10 paying customers; $6.5k–$7.5k MRR; retention > 90%** |

### Gate discipline

Every gate is **prepaid money or a hard measurable**, not "five prospects said it sounds cool." If a gate fails, stop building and change the problem, positioning, or price — do not add features to a product nobody pays for.

---

## 10. Anti-Failure Rules (the YC RIP list guard)

1. **Prepayment is the only validation.** "I'd definitely buy that" is not validation. A credit card charge is.
2. **Rule of Three.** No feature/integration/capability unless **three** paying prospects explicitly need it.
3. **No integration hell.** PDF, CSV, generic REST first. Direct PSA/RMM connectors only after 10 paying customers and 3+ requesting the same one.
4. **AI containment.** Agents have ZERO authority over publication, access control, source systems, or exports.
5. **The pivot trigger.** If three paid pilots do not renew after a single report cycle, stop building. Change the problem, positioning, or price. Do not add features to a product nobody wants.
6. **No free work.** No free pilots. No "try it for a month." No custom development for a single customer.
7. **No marketplace shortcuts.** Pax8/ConnectWise marketplaces after customer proof, not before.
8. **Ship weekly.** More than 7 days without a deploy = building in a vacuum.
9. **The Core Truth.** If RipoDoc does not measurably reduce report preparation effort OR improve a client-value conversation, it is an add-on feature, not a company. Kill it or pivot.
10. **Scope is the enemy.** Every feature not in the MVP is a distraction. The MVP is: upload → extract → review → publish → share → click-to-data → audit.

---

## 11. Launch Sequence (Month 6 and beyond)

### 11.1 Public launch checklist

- [ ] 10 paying customers
- [ ] 2 reference stories (permissioned case studies)
- [ ] Pen test passed
- [ ] Legal pack signed (DPA, privacy, terms)
- [ ] Pricing page + self-serve onboarding (basic)
- [ ] Landing page live with the interactive demo
- [ ] SOC 2 Type 1 readiness
- [ ] Referral program live

### 11.2 Post-launch

| Month 7–9 | Month 9–12 | Month 12+ |
| :--- | :--- | :--- |
| First 2 PSA/RMM integrations (3+ requests) | Embedded mode beta | Pax8 / ConnectWise marketplace listings |
| Template library | API documentation | First hire (full-stack) at $10k+ MRR |
| Refine pricing from MRR data | Customer success motion | Second hire (CSM) at 15+ customers |

---

## 12. Open Questions (must be answered with evidence, not speculation)

| Question | How to answer | Deadline |
| :--- | :--- | :--- |
| Do MSPs actually lose clients over bad reporting? | 15 discovery calls. Ask directly. | Day 14 |
| Will MSPs pay $499–$799/mo for this? | 3 prepaid founding partners | Day 30 |
| Is PDF extraction accurate enough for real-world reports? | Process 5 real partner reports; measure correction time | Day 45 |
| Do clients actually click the interactive elements? | PostHog analytics on first 10 published reports | Day 60 |
| What are the top 3 integration requests? | Survey first 10 customers | Day 90 |
| Is the review queue a feature or a friction point? | Partner feedback + time-to-publish metrics | Day 60 |
| Additive or displacement pricing? | The two-question probe in every discovery call | Day 30 |
| What is the real churn rate after one report cycle? | Track renewals at Day 90 | Day 90 |

---

## 13. Final Verdict

- **Build:** yes.
- **Positioning:** the secure reporting delivery and evidence layer for MSPs — not an MSPBots clone.
- **Market:** real, $10–$50M ARR potential within a ~6k–12k firm ICP pool. Not a proven $100M standalone today.
- **Product:** interactive evidence-backed reports where the click survives the PDF, the email, the forward and the phone — with the three unoccupied columns (review gate, recipient-bound delivery, audit trail) as the defensible claim.
- **AI:** yes, as author assistants with strict containment. The reader stays deterministic.
- **Money:** $34k–$70k bootstrap runway; $4.5k from 3 prepaid founding partners in Month 1–2; $7.5k MRR at 10 customers by Month 6.
- **The gate:** 5 MSPs pay ≥$500/mo for 3 consecutive report cycles and cut prep by 70%+. If that doesn't happen, it's a feature, not a company.

**The standard is not "good enough." The standard is "holy shit, that's done."**