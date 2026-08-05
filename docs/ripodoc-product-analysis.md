# RipoDoc Product Strategy & Implementation Analysis

## Executive Summary

RipoDoc is a secure reporting delivery and evidence layer for Managed Service Providers (MSPs) that transforms static PDFs, CSVs, and API-connected data into interactive reports. When a client clicks any KPI, chart, table, or data point in a PDF-like interface, a token-bound modal window displays the approved underlying structured data in a sortable, searchable table with export capabilities.

This document consolidates five deliverables: (1) Market Feasibility Assessment, (2) Technical Feasibility Analysis, (3) Six-Month Product Roadmap, (4) Bug & UX Fixes, and (5) a Production-Ready PRD.

The codebase as of commit `9341043` ships a battle-tested PDF engine (127 tests), token-gated evidence pages, a hash-chained audit log, and an overlay engine that makes existing PDFs clickable while preserving every original byte. The Go API backend, PostgreSQL database, and AWS infrastructure are planned but not yet built. The existing `IDEA.md` and supporting docs in `docs/` provide the foundational vision, market research, and execution framework; this document synthesizes and updates them against the current codebase reality and the latest competitive intelligence.

**Key finding:** RipoDoc's defensibility does not rest on "click a chart, see the rows" — that is commodity in Power BI, Metabase, and even MSPBots' public dashboards. Its defensibility is the *combination* of three properties no competitor occupies simultaneously: (1) a human review gate before publication, (2) recipient-bound, expiring, revocable, watermarked delivery, and (3) an immutable, hash-chained audit trail — all delivered from the PDF an MSP already emails, not from a dashboard the client must visit.

---

## 1. Market Feasibility Assessment

### 1.1 Market Size

| Metric | Value | Strength | Source |
|---|---|---|---|
| UK active MSPs | 11,492 (Aug 2023) | VERIFIED | DSIT, *Research on UK managed service providers*, Feb 2024 |
| UK MSPs ≥50 staff | 1,512 (13% of market) | VERIFIED | DSIT arithmetic on size bands |
| Firms delivering managed services, globally | ~341,000 (2025) | SECONDARY | Canalys MSP Trends 2025 (via Omdia) |
| US MSPs | 40,000+ | SECONDARY | Infrascale MSP Statistics USA |
| English-speaking core MSP pool | ~60,000–70,000 | DERIVED | US + UK + CA/AU/NZ/IE allowance |
| Qualifying ICP firms (20–150 staff, 50+ clients) | ~6,000–12,000 | DERIVED (upper bound) | Core pool × ICP band share |

**Critical constraint:** The $401B global MSP services revenue figure is *not* RipoDoc's Total Addressable Market (TAM). It is IT services revenue — the budget pool MSPs operate within, not the software budget they allocate. RipoDoc sells into a sub-slice of that pool: the ~6,000–12,000 qualifying MSPs that spend meaningfully on reporting and have 50+ client relationships to report on.

### 1.2 Category Ceiling and Pricing Reality

The MSP-specific reporting category has a verified price ceiling of **$449/month** (ScalePad Cognition360, which requires an additional Power BI licence per active user). The original `IDEA.md` pricing of $750–$2,500/month is **unsupportable as an additive purchase** — it would consume 30–150% of an entire MSP software stack budget for a single reporting tool.

However, **Handover** — a stealth competitor not in the original `IDEA.md` — prices at **£49–£99/month** and already occupies the narrative reporting position. Handover connects natively to HaloPSA and ConnectWise Manage, generates QBR packs (PowerPoint + Excel + executive summary) in under 60 seconds, and has the gap RipoDoc is built for: no interactive evidence layer, no review queue, no recipient-bound delivery, no audit trail.

| Path | Realistic price | What it requires |
|---|---|---|
| **Additive** (16th–21st vendor in the stack) | Low hundreds/mo | Nothing new. The $12k ACV model dies. |
| **Displacement** (replaces BrightGauge/Cognition360 as a line item) | $400–$1,000+/mo | PSA/RMM connectors — deferred per the Rule of Three |

**Recommendation:** Adopt the revised pricing from `master-plan.md` ($499 Founding Partner, $799 Core, $1,499+ Scale). Run the two-question pricing probe in every discovery call. Pivot to displacement pricing only after 3+ paying customers request the same PSA/RMM connector.

### 1.3 Customer Segments and Use Cases

RipoDoc serves three primary segments equally:

| Segment | Primary Use Case | RipoDoc Value Proposition |
|---|---|---|
| **MSP Account Managers** | Sharing monthly performance reports with clients to demonstrate value and justify contracts | Clients click any figure and see the exact rows behind it — no fumbling during QBRs |
| **MSP Executives/Owners** | Building internal dashboards and analytics for operational insights | Human-reviewed, auditable reports that prove value to internal stakeholders and for client renewals |
| **Enterprise Companies** | Sharing KPI reports across departments for cross-functional visibility | Document-shaped reports with scoped per-recipient data, watermarking, expiry, and revocation |

Each segment values RipoDoc's combination of interactivity, security, and auditability — but for different reasons. MSPs buy for client retention and QBR confidence; enterprises buy for data governance and compliance audit trails.

### 1.4 Competitive Positioning

**RipoDoc's uniqueness is the combination, not any single column:**

| Competitor | Document-shaped | Reader sees rows | Human review gate | Recipient-bound + revocable | Immutable audit trail | MSP-native |
|---|---|---|---|---|---|---|
| MSPBots | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ |
| BrightGauge | ✗ | ~ | ✗ | ~ | ✗ | ✓ |
| Cognition360 | ✗ | ✓ (via Power BI) | ✗ | ~ | ✗ | ✓ |
| Lifecycle Insights | ✓ | ✗ | ✗ | ~ | ✗ | ✓ |
| Handover | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Power BI / Metabase | ✗ | ✓ | ✗ | ~ | ✗ | ✗ |
| Foleon | ✓ | ✗ | ✗ | ~ | ✗ | ✗ |
| **RipoDoc** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** |

The competitive moat is narrow but real: **nobody delivers click-to-evidence from a secure, recipient-bound, auditable PDF-like document with a mandatory human review gate.** The positioning must lead with "secure delivery and evidence layer" — not "interactive PDF" — because the latter is a feature, not a category.

### 1.5 Demand Validation Signals

1. **MSPBots teardown (2026-07-26):** A public MSPBots report link exposes a real MSP's live client data — client list, per-deal margins, entire staff roster — with no authentication, no recipient binding, no expiry, no revocation, no watermarking. The gap is structural: link-sharing has no concept of a recipient.
2. **Power BI end-user docs:** Right-click a visual → *Show as a table* works for report consumers (not just developers). Click-to-evidence in BI is table stakes.
3. **Metabase:** Drill-through is a marketed headline feature.
4. **Handover:** Already on both ConnectWise and HaloPSA marketplaces, pricing at 1/10th of the original proposed ladder.
5. **Key insight from mspbots-teardown:** The problem is not "clients can't see the data" — it's "the MSP cannot control who sees which data, cannot prove who saw it, and cannot take it back."

### 1.6 Market-Sizing Stress Test

- The 6,000–12,000 qualifying MSP pool is an **upper bound**. The "50+ managed clients" criterion further reduces it by an unknown amount.
- A healthy niche SaaS scenario (200 MSPs at $8k ARR = $1.6M ARR) requires 2–3% penetration — plausible.
- A serious vertical company (1,000 MSPs at $12k ARR = $12M ARR) requires 8–17% penetration — a stretch.
- The $100M+ scenario (6,700 MSPs) requires 56–112% of every qualifying MSP on Earth — deleted from the plan.
- **Realistic 3-year target:** 1,000 paying MSPs at ~$12k/year = $12M ARR.

---

## 2. Technical Feasibility Analysis

### 2.1 Current Architecture (Shipped vs. Planned)

The codebase follows a **modular monolith** design. The shipped components are highly refined and well-tested; the planned Go backend is not yet implemented.

**Shipped today:**

| Component | Location | Tests | Status |
|---|---|---|---|
| PDF engine (1.7 writer) | `tools/evidence-pdf/src/pdf/` | 127 tests | ✅ Production quality |
| Overlay engine (byte-preserving incremental update) | `tools/evidence-pdf/src/overlay/` | | ✅ Verified against LibreOffice PDFs |
| Token engine (HMAC-SHA256) | `web/frontend/src/lib/evidence/token.ts` | | ✅ Shipped |
| Audit log (hash-chained) | `web/frontend/src/lib/evidence/audit-log.ts` | | ✅ Verifier shipped (`npm run audit:verify`) |
| Evidence pages | `web/frontend/src/app/e/` | | ✅ Token-gated, searchable, sortable, CSV export |
| Marketing site | `web/frontend/src/app/page.tsx` | | ✅ Shipped |

**Planned (not yet built):**

| Component | Planned location | Status |
|---|---|---|
| API backend | `cmd/api/` (Go) | ⏳ Planned |
| Worker service | `cmd/worker/` (Go) | ⏳ Planned |
| PostgreSQL (RLS) | AWS RDS | ⏳ Planned |
| River job queue | Redis + Go worker | ⏳ Planned |
| Auth (WorkOS) | SSO/SAML | ⏳ Planned |
| Billing (Stripe) | Go + Stripe SDK | ⏳ Planned |
| AWS infrastructure | ECS Fargate, S3, KMS, Textract | ⏳ Planned |

### 2.2 Architecture Assessment

**Strengths:**
- **Trust boundary is well-defined.** The PDF engine, token engine, and audit chain are the product's security claims. They are dependency-free, byte-verifiable, and pinned by tests. The reader re-parses the finished PDF from its trailer — "we wrote N annotations" is not trusted; "a reader finds N annotations" is.
- **Determinism on the read path.** Nothing is computed at view time. The evidence page renders rows that a human approved before publication. This eliminates hallucination risk entirely on the read path.
- **Byte-preserving overlay.** The customer's original PDF is asserted to be a byte-for-byte prefix of the output. Forwarding the file does not forward the data.
- **Comprehensive test coverage.** 127 tests across PDF primitives, token signing/verification, manifest validation, overlay planning/geometry/text, and audit chain integrity.

**Technical risks and blockers:**

| Risk | Severity | Assessment | Mitigation |
|---|---|---|---|
| Go backend not yet built | High | The API server, worker, database, auth, and billing do not exist. Nothing is deployed beyond a static Vercel site with static evidence pages. | Build MVP backend incrementally; use file-based store as a temporary data layer during early validation |
| PDF extraction accuracy | High | AI/Vision models achieve 70–90% accuracy on chart data. Bar charts with data labels are easiest; stacked/grouped bars and unlabelled values are hardest. OCR cannot recover values from visual geometry. | Position as "AI-assisted, human-verified." Ship CSV/REST ingestion first; PDF overlay is the delivery layer, not the extraction promise |
| Multi-tenancy (RLS) | Medium | PostgreSQL RLS is planned but unimplemented. The current store reads from disk files. | Implement RLS before any multi-tenant deployment; use application-layer tenant validation as a stopgap |
| Single-tenant bottleneck | High | Solo founder. No backend engineer. Go API, worker, database, auth, billing, infra — all need to be built. | Prioritize the critical path: auth → tenant scope → report CRUD → share links → evidence pages. Outsource non-critical frontend work |
| AI containment complexity | Medium | Four AI agents (Extraction, Data-Mapping, Narrative, QA) must be contained with strict policies. Prompt injection testing is listed as "to add before AI agents ship." | Implement agents behind a human review gate from day one. Never ship autonomous publication |

### 2.3 Security Assessment

The shipped components are exceptionally well-secured:

- **Tokens:** HMAC-SHA256 binds report, version, recipient-hash, expiry, and jti. Recipient email is *hashed*, never embedded. Timing-safe comparison via `timingSafeEqual`. Weak secrets (<32 chars) cause the app to throw.
- **Audit chain:** `hash(n) = SHA-256(hash(n-1) ‖ canonical(record n))`. Tampering is *detectable*, never "impossible." Verified by `npm run audit:verify`.
- **PDF safety:** No embedded JavaScript (tested), encrypted PDFs refused, URI schemes restricted to `https`, loopback `http` requires explicit opt-in, spreadsheet formula injection prevented in CSV export.
- **Scoped disclosure:** Evidence pages render one element of one version for one recipient — never the whole report's data.
- **No-index:** Evidence routes are `noindex, noarchive, nocache` — a cached copy cannot outlive revocation.

**Gap:** The planned AWS infrastructure (RDS, S3, KMS, Textract, WAF) and SOC 2 compliance are not yet implemented. The security claims hold for the shipped TS evidence pages but need to extend to the Go backend, database, and cloud infrastructure before production.

### 2.4 Scalability Assessment

The current architecture supports the MVP scope well:

- **PDF generation:** Benchmark shows a 500-ticket report generates in reasonable time. Load testing is planned for Month 5.
- **Database:** PostgreSQL with RLS and River (PostgreSQL-backed queue) avoids separate queue infrastructure.
- **Frontend:** Next.js SSR/ISR for evidence pages. Static site generation for marketing.
- **Infrastructure:** ECS Fargate for auto-scaling. CloudFront + WAF for DDoS protection.

**Constraint:** The hand-rolled PDF engine is in TypeScript, not Go. If PDF generation throughput becomes a bottleneck at scale, it can be ported to Go later — but only after performance demands it. The current engine is byte-verified and dependency-free; porting it prematurely would risk the trust boundary.

---

## 3. Product Roadmap (6 Months)

### 3.1 MVP Scope

The MVP is narrowly defined: **upload → extract → review → publish → share → click-to-data → audit**. Everything else waits until after 3 prepaid customers validate retention.

**MVP Features:**
- PDF upload and overlay (existing PDF → clickable PDF)
- CSV import with column detection
- Generic REST API ingestion
- Report reader with KPI/bar-chart/claim click zones
- Human review queue with confidence scores and corrections
- Publish flow with immutable version freezing
- Recipient-bound, expiring, revocable share links
- Token-gated evidence pages (searchable, sortable, CSV export when authorized)
- Hash-chained audit log
- Watermarking on evidence pages
- Customer portal (authenticated view of shared reports)

### 3.2 Six-Month Roadmap

| Phase | Month | Goal | Key Deliverables | Milestone Gate |
|---|---|---|---|---|
| **Phase 1: Validation** | Month 1 | Ship a working MVP and close 3 prepaid founding partners | Go API skeleton (`cmd/api`), WorkOS auth, PostgreSQL withRLS, tenant middleware, report CRUD, share-link API, CSV ingestion, review queue, publish flow, customer portal | 3 founding partners paying $2,250 upfront ($6,750 collected) |
| **Phase 2: Beta** | Month 2–3 | Onboard partners, harden the product | PDF overlay via CLI integrated into API, audit log in PostgreSQL (hash-chained), export controls, watermarking, RestAPI ingestion, report viewer with evidence drawer, RBAC (owner/admin/author/reviewer/client) | 5 paying customers; 70% of pilots renew after one cycle |
| **Phase 3: Hardening** | Month 4–6 | Security, compliance, go-to-market | SOC 2 Type 1 readiness, pen test, DPA/privacy/terms legal pack, CSV/REST adapters, restore drill, incident response test, 2 case studies, referral program | 10 paying customers; $7.5k+ MRR; retention >90%; SOC 2 Type 1 assessment complete |

#### Phase 1: Validation (Month 1)

| Week | Product | Sales | Gate |
|---|---|---|---|
| 1 | PRD finalised. Landing page live. Demo report built (existing). Go API skeleton. WorkOS auth. PostgreSQL with RLS + tenant middleware. | 400-account list built. 15 discovery calls. | 5 prospects confirm the pain (4+ hrs/client/quarter, lost client/renewal) |
| 2 | Upload flow (PDF + CSV). Basic extraction. Report CRUD API. Share-link API. Customer portal login. | 10 more discovery calls. | 3 prospects request a demo with their own data |
| 3 | Report reader. Click-to-data drawer. Review queue skeleton (confidence scores, corrections). | 5 demos delivered. | 3 prospects say "I'd pay for this." |
| 4 | Review queue complete (approval gate). Publish flow (immutable version freeze). Share links (recipient-bound, expiring, revocable). | Close first 3 founding partners ($2,250 each prepaid). | **$6,750 collected. 3 paying customers.** |

#### Phase 2: Beta (Months 2–3)

| Week | Product | Sales | Gate |
|---|---|---|---|
| 5–6 | Onboard first 3 partners. Build their first real report together. PDF overlay integrated into API. Audit log in PostgreSQL. Export controls. Watermarking. | Weekly check-ins with partners. | Each partner processes a real client report |
| 7–8 | Generic REST ingestion. Report viewer improvements. RBAC implementation. | 10 more discovery calls. | Partners use RipoDoc for a real QBR |
| 9–10 | Customer portal (full). Template system (basic). QA checks (deterministic). | Close 2 more partners. | 5 paying customers |
| 11–12 | Narrative agent (assist-only). Performance optimisations. Bug fixes. | Collect testimonials. | 70% of pilots renew after one cycle |

#### Phase 3: Hardening (Months 4–6)

| Week | Product | Sales | Gate |
|---|---|---|---|
| 13–14 | CSV and REST adapters. Template library expansion. | 10 more discovery calls. | No custom code per customer (Rule of Three) |
| 15–16 | Security hardening. Pen test. Legal pack (DPA, privacy, ToS). | Close 2 more partners. | Pen test passed. Legal docs signed. |
| 17–18 | Restore drill. Incident response test. SOC 2 Type 1 preparation. | Create 2 case studies. | Founder intervention <15 mins/report |
| 19–20 | Embedded report beta (iframe). API documentation. | Launch referral program. | 10 paying customers |
| 21–22 | Public launch. Pricing page. Self-serve onboarding (basic). | Content marketing. MSP community presence. | $7.5k+ MRR |
| 23–24 | SOC 2 Type 1 assessment. Final polish. | Collect retention metrics. | Retention >90%. 10 paying customers. |

### 3.3 Feature Priority Matrix

| Feature | Segment Impact | Security Impact | Implementation Effort | Priority |
|---|---|---|---|---|
| PDF overlay (byte-preserving) | MSP AM: High, Exec: Med, Enterprise: Med | High | Low (shipped) | P0 |
| CSV ingestion | MSP AM: High, Exec: High, Enterprise: High | Low | Low | P0 |
| REST API ingestion | MSP AM: Med, Exec: Low, Enterprise: High | Low | Med | P0 |
| Human review queue | All: High | High | Med | P0 |
| Publish + immutable versions | All: High | High | Med | P0 |
| Recipient-bound share links | MSP AM: High, Exec: Med, Enterprise: High | High | Low (token engine shipped) | P0 |
| Audit log | Enterprise: High, MSP AM: Med, Exec: Med | Critical | Low (shipped) | P0 |
| Watermarking | Enterprise: High, Exec: High, MSP AM: Med | Med | Med | P1 |
| RBAC | Enterprise: High, Exec: Med, MSP AM: Low | Med | High | P1 |
| Customer portal | MSP AM: High, Enterprise: Med, Exec: Low | Low | Med | P1 |
| Generic REST connectors | MSP AM: Med, Exec: Low, Enterprise: Med | Low | High (deferred) | P2 |
| Dashboard builder | Exec: High, MSP AM: Med, Enterprise: Low | Low | Very High | Out of scope |
| AI agents | All: Med | High | Very High | Out of scope (until security tests pass) |

### 3.4 Security & Compliance Timeline

| Month | Activity | Requirement |
|---|---|---|
| Month 1 | HIPAA/BAA assessment | If healthcare MSPs targeted |
| Month 2 | SOC 2 Type 1 readiness (TSCs mapped) | Readiness assessment, not full audit |
| Month 4 | Pen test (independent) | Critical finding remediation required |
| Month 5 | SOC 2 Type 1 audit | Type 1 (point-in-time) assessment |
| Month 6 | Restore drill + incident response test | Test backup/restore and breach response |

### 3.5 Integration Strategy

Per the **Rule of Three** anti-failure rule: do not build direct PSA/RMM connectors before 10 paying customers. Start with PDF, CSV, and generic REST API. The first direct connector ships only after 3+ paying customers request the same one.

**MVP integrations:** PDF (overlay path), CSV (native), generic REST API (OAuth 2.0 + API key auth).

**Deferred (post-MVP):** ConnectWise Manage, HaloPSA, NinjaOne, Datto, Kaseya — only if requested by 3+ paying customers.

### 3.6 Constraints and Assumptions

- **Solo founder.** No backend engineer on staff. Go API must be built by the founder. Frontend can be outsourced.
- **Bootstrap budget.** $34,000–$70,000 required for 6 months. Revenue offset from 3 founding partners ($6,750 upfront) + 10 customers by Month 6 ($7,500 MRR).
- **Node 22.6+ required** for native TypeScript execution (`--experimental-strip-types`).
- **127 tests must remain green** at all times. CI gate: `npm run verify` (typecheck → tests → build).
- **No AI agents in production** until prompt injection, cross-tenant leakage, fabricated-data, and incorrect-chart-interpretation tests are written and passing.

---

## 4. Bug and Button Fixes

### 4.1 Critical Issues (P0)

| # | Issue | Location | Severity | Description | Fix |
|---|---|---|---|---|---|
| 1 | **Upload is fully simulated** | `web/frontend/src/app/upload/page.tsx` | Critical | The upload page uses `setInterval` to fake progress and `setTimeout` to fake success. No file is actually processed, extracted, or persisted. The "Configure overlay" and "View as interactive report" buttons have no click handlers. The marketing site claims "Upload your own PDFs directly from the web UI" but this is not real. | Replace the simulated upload with the real `AuthoringWizard` (types, parsers, draft management, local Docker proxy). Connect the "Publish" button to the real manifest store. |
| 2 | **ReportViewer is dead code** | `web/frontend/src/components/ReportViewer.tsx` | High | `ReportViewer.tsx` imports `tailwind-merge`, `lucide-react` icons, and defines its own mock `Report` type with hardcoded data. It is never imported or rendered anywhere. It duplicates functionality already in `EvidenceGrid.tsx` and `SampleReport.tsx`. | Delete `ReportViewer.tsx`. Its functionality (in-page drawer with source data table) is already implemented in `SampleReport.tsx` and `EvidenceGrid.tsx`. |
| 3 | **SampleReport hardcodes canExport** | `web/frontend/src/components/marketing/SampleReport.tsx` | High | `SampleReport` passes `canExport={true}` to `EvidenceGrid` unconditionally, bypassing the real `exportsEnabled()` config check that the actual evidence pages use. | Pass `canExport={true}` with a clear comment that this is sample data for the marketing demo (not a security issue in production, but should be documented as intentional). |

### 4.2 High-Priority Issues (P1)

| # | Issue | Location | Severity | Description | Fix |
|---|---|---|---|---|---|
| 4 | **Empty dashboard and security routes** | `web/frontend/src/app/dashboard/` and `web/frontend/src/app/security/` | Medium | Both directories exist but are empty. The marketing site references "A dashboard with analytics and access logs" but no dashboard route renders. The security page referenced in the marketing site doesn't exist. | Implement `dashboard/page.tsx` (analytics + access logs) and `security/page.tsx` (security model explainers) as part of Phase 2. |
| 5 | **No evidence page rendering for line-chart and table** | `web/frontend/src/app/e/[token]/page.tsx` | Medium | `KIND_LABEL` only supports `kpi`, `bar-chart`, and `claim`. The manifest type in `existing implementation_plan.md` extends `ElementKind` to include `line-chart` and `table`, but the evidence page index would show "Figure" for these. | Add `'line-chart'` and `'table'` to `KIND_LABEL` when these element kinds ship. |
| 6 | **Navbar says "Upload PDF"** | `web/frontend/src/components/Navbar.tsx` | Low | The Navbar labels the upload link "Upload PDF" but RipoDoc's value proposition is multi-format (PDF, CSV, REST API). | Change to "Create report" or "Author report" to match the intended brand positioning. |
| 7 | **Upload page only accepts PDFs** | `web/frontend/src/app/upload/page.tsx` | Medium | `handleDrop` and `handleFileInput` hardcode PDF-only filtering: `f.type === 'application/pdf' || f.name.endsWith('.pdf')`. The marketing site promises "multi-format" support. | The full `AuthoringWizard` (per `existing implementation_plan.md`) replaces this with true multi-format support. |

### 4.3 UX Improvements per Segment

#### MSP Account Managers (QBR workflow)

| Issue | Recommendation |
|---|---|
| During a client QBR, the MSP needs to respond instantly to "show me the data behind that number" | The evidence drawer should display the provenance (source system + query) and the approving author prominently. Currently implemented in `[elementId]/page.tsx` — ensure the "How this figure was calculated" section is always visible, not buried. |
| MSPs send static PDFs and lose the QBR conversation when clients ask for raw data | The overlay path must be seamless: upload existing PDF → auto-detect zones → human review → one-click publish → client gets a clickable PDF. Currently the overlay is CLI-only (`npm run overlay:propose`). |
| Clients forget which report a link is for | The evidence page header should repeat provider, client, period, and version prominently. Currently implemented — verify the design is clear enough. |

#### MSP Executives/Owners (internal dashboards)

| Issue | Recommendation |
|---|---|
| No internal dashboard exists | The `dashboard/` route is empty. Phase 2 must deliver an analytics dashboard showing: report publication history, access metrics, audit log viewer, and tenant usage. |
| No way to track report performance across client orgs | Add a report index with filters (by client, date range, status) and key metrics (views, exports, denials). |
| No at-a-glance security/compliance status | Add a security dashboard tab showing: active share links, expiring links, revoked links, recent audit events. |

#### Enterprise Companies (cross-departmental visibility)

| Issue | Recommendation |
|---|---|
| No RBAC or role definitions exist | Phase 2 must implement RBAC (owner, admin, author, reviewer, client). The evidence pages already scope to one recipient; extend this to enterprise roles. |
| No watermarking on evidence pages | Phase 2 must add configurable watermarking (recipient name + timestamp) to evidence pages. |
| No audit log UI | The audit log exists as a JSONL file (`var/evidence-access.jsonl`) and is verifiable via `npm run audit:verify`, but there is no browser-accessible audit viewer. Phase 2 must add an audit log viewer in the customer portal. |

### 4.4 Technical Debt

| Issue | Location | Recommendation |
|---|---|---|
| Upload page duplicates the design system | `upload/page.tsx` uses `lucide-react` + inline Tailwind, while the rest of the app uses a mix of `lucide-react` and `tailwind-merge`. | Migrate `upload/page.tsx` to the `AuthoringWizard` pattern once it ships. |
| No `AGENTS.md` or `.clinerules` for AI coding agents | Repo root | The README mentions `AGENTS.md` compatibility but `.clinerules/` and `.cursor/rules/` are not present. | Add agent rules files to ensure future AI-assisted development respects the trust-boundary conventions. |
| `vercel.json` config may restrict evidence page routing | `web/frontend/vercel.json` | Verify that `/e/[token]/[elementId]` routes are correctly configured for SSR on Vercel. |

---

## 5. Product Requirements Document (PRD)

### 5.1 Goal

Enable MSPs to publish client reports that remain readable like PDFs while allowing authorised recipients to click any KPI, chart, table, or supported claim and inspect its approved underlying data in an in-page drawer. The data is deterministic — it was approved by a human before publication — and the link is recipient-bound, expiring, revocable, and audited.

### 5.2 Users and Personas

| Persona | Role | Goals | Pain Points |
|---|---|---|---|
| **MSP Owner/vCIO** | Decision-maker | Repeatable, profitable reporting that proves value and secures renewals | Spends 4–10 hrs/client/quarter assembling reports from 5–12 tools; lost clients to "lack of visibility" |
| **Report Author/Reviewer** | MSP staff | Create reports, validate extracted data, approve publication | Tools produce flat PDFs with no way to verify numbers; no audit trail of what was published |
| **Client Executive** | Report reader | Understand performance metrics without learning BI tools | Static PDFs can't answer "show me the 14 items behind that number"; emailed spreadsheets are insecure |
| **Enterprise Admin** | IT/security | Share KPI reports cross-departmentally with governance controls | Public links expose too much data; no watermarking or expiry; no way to prove who accessed what |

### 5.3 User Workflows

#### Workflow A: MSP Author Creates and Publishes a Report

1. Author creates a customer workspace and selects "New Report."
2. Author uploads a PDF, CSV, or connects a data source via REST API (generic connector).
3. RipoDoc processes the upload: native text extraction (pdfcpu) → OCR fallback (AWS Textract) for scans; CSV column detection + type inference; REST API schema validation.
4. Author enters the review queue: sees each extracted element with its confidence score, corrects misread values, attaches source data, marks elements as "visual only" or "data-backed," and approves or rejects each element.
5. QA agent runs deterministic checks (totals reconcile, no contradictions, every approved element has a source).
6. Author publishes an immutable report version. A static PDF companion is generated with secure link annotations back to the hosted evidence pages.
7. Audit log records the publication event.

#### Workflow B: Author Delivers to a Client

1. Author selects a published report version and creates a share link.
2. Author specifies the recipient (name + email), sets expiry (e.g., 14 days), and configures controls (download permitted, export permitted, watermark on/off).
3. RipoDoc mints a recipient-bound token: HMAC-SHA256 binding report, version, recipient-hash, expiry, and jti.
4. Author sends the link via email or provides it through the MSP's client portal.
5. The link opens the report reader — a PDF-like interface where every data-backed element has a subtle click indicator.

#### Workflow C: Client Recipient Reads and Inspects

1. Recipient receives the secure link and clicks it (or a figure in the emailed PDF).
2. Token is verified at the boundary: signature, expiry, revocation status, recipient match. Every access — granted or denied — is logged before rendering.
3. If valid, recipient sees the report rendered as a PDF-like document:
   - Executive summary
   - KPI cards
   - Charts (bar, line, pie)
   - Tables
   - Narrative paragraphs
4. Recipient clicks any data-backed element. An in-page drawer slides open showing:
   - The element's title and summary
   - "How this figure was calculated" (source system + query)
   - The approved source data in a searchable, sortable, paginated table
   - CSV export button (if authorised by the MSP)
   - Formula-injection-safe CSV export (cells starting with `=`, `+`, `-`, `@` are quote-prefixed)
5. "Back to report" closes the drawer.

#### Workflow D: Enterprise Admin Manages Reports

1. Admin logs into the customer portal with SSO.
2. Admin sees a dashboard of reports shared with their organisation.
3. Admin can view who accessed which report and when (audit log viewer).
4. Admin can revoke access to any report link by its jti.
5. Admin can download watermarks reports with their department name.

### 5.4 MVP Scope

**In scope:**
- PDF upload and overlay (make an existing PDF clickable, byte-preserving)
- CSV import with column detection and type inference
- Generic REST API ingestion (OAuth 2.0 + API key auth)
- Report reader with KPI, bar-chart, and claim click zones
- Human review queue with confidence scores, corrections, and approval state
- Publish flow with immutable version freezing
- Recipient-bound, expiring, revocable share links (HMAC-SHA256)
- Token-gated evidence pages (searchable, sortable, paginated, CSV export when authorized)
- Hash-chained, append-only audit log (verifiable via `npm run audit:verify`)
- Watermarking on evidence pages (recipient name + timestamp)
- Customer portal (authenticated view of shared reports, audit log viewer)
- RBAC with roles: owner, admin, author, reviewer, client

**Explicitly out of scope:**
- Perfect extraction of every PDF without human review
- A full dashboard builder (not a BI tool)
- Anonymous public reports
- Write access to CRM, PSA, RMM, or billing platforms
- Customer-facing AI chatbot in the first 6 months
- Direct PSA/RMM connectors (deferred per Rule of Three — 3+ paying customers must request the same one)
- Embedded mode (iframe inside MSP's own portal)
- Line and pie chart visualisations

### 5.5 Functional Requirements

#### FR-1: Upload and Ingestion
- FR-1.1: Accept PDF, CSV, and generic REST API as data sources.
- FR-1.2: PDF files up to 50 MB; CSV files up to 10 MB.
- FR-1.3: Reject encrypted PDFs with `EncryptedPdfError` (never re-save an encrypted file unprotected).
- FR-1.4: Reject files containing executable constructs.
- FR-1.5: For PDFs, run native text extraction first; fall back to AWS Textract OCR for scanned documents.
- FR-1.6: For CSV, detect columns, infer types (string, number, date, boolean), and preview the first 50 rows.
- FR-1.7: For REST API, validate schema and allow field mapping to report elements.

#### FR-2: Review Queue
- FR-2.1: Display each extracted element with its confidence score (0–1).
- FR-2.2: Allow the author to correct misread values.
- FR-2.3: Allow the author to attach source data (from CSV columns, API fields, or manual entry).
- FR-2.4: Allow the author to mark elements as "visual only" (no underlying data) or "data-backed."
- FR-2.5: Require `approvedBy` (a named human) for every data-backed element before publication.
- FR-2.6: Record `approvedAt` as an ISO 8601 timestamp.

#### FR-3: Publish
- FR-3.1: Publishing freezes an immutable report version. No edits after publish.
- FR-3.2: The publisher must be the same tenant that created the draft.
- FR-3.3: Audit log records `report.published` with version and author.
- FR-3.4: A static PDF companion is generated with link annotations pointing to hosted evidence pages.
- FR-3.5: The PDF generator asserts `linkCount === elements.length` before writing the file.

#### FR-4: Share Links
- FR-4.1: Mint a token binding report, version, recipient-hash, expiry, and jti.
- FR-4.2: Recipient email is hashed (SHA-256), never embedded in the token.
- FR-4.3: Token compared with `timingSafeEqual` (constant-time).
- FR-4.4: Tokens expire at a configurable TTL (default 14 days).
- FR-4.5: Any single link can be revoked by its jti without rotating the signing key.
- FR-4.6: A token for v3 cannot open v4; superseded versions fail closed.
- FR-4.7: Evidence links are `noindex, noarchive, nocache`.

#### FR-5: Evidence Pages
- FR-5.1: Render one element of one version for one recipient.
- FR-5.2: Display the element's title, summary, and "How this figure was calculated" (source system + query).
- FR-5.3: Display the approved source data in a searchable, sortable, paginated table.
- FR-5.4: CSV export only when the authorisation flag is set.
- FR-5.5: CSV export quote-prefixes cells starting with `=`, `+`, `-`, `@` (spreadsheet formula injection prevention).
- FR-5.6: Display provenance: who approved it, when, and the immutable version.
- FR-5.7: Display watermark with recipient name and timestamp.
- FR-5.8: Log every access (granted or denied) before rendering.

#### FR-6: Audit Log
- FR-6.1: Every access, granted or denied, is recorded.
- FR-6.2: Records are hash-chained: `hash(n) = SHA-256(hash(n-1) ‖ canonical(record n))`.
- FR-6.3: The audit chain is verifiable without the server via `npm run audit:verify`.
- FR-6.4: Tampering with any record (edit, delete, reorder) is detectable.
- FR-6.5: The log captures: token verification failures, granted/denied access, exports, revocations, publications, and admin actions.

### 5.6 Non-Functional Requirements

#### Security
- NFR-S-1: All database queries must be tenant-scoped. PostgreSQL RLS mandatory.
- NFR-S-2: No AI agent can publish, export, or modify access. Human review gate is mandatory.
- NFR-S-3: All numerical data is deterministic (SQL), never LLM-generated.
- NFR-S-4: A customer's document is appended to, never rewritten (byte-preserving overlay).
- NFR-S-5: Every evidence zone is approved by a named person before publication.
- NFR-S-6: Signing secret must be ≥32 characters. The app throws if shorter.
- NFR-S-7: TLS 1.2+ everywhere. No HTTP in production.
- NFR-S-8: Evidence token verification fails closed on any error.

#### Performance
- NFR-P-1: Evidence page renders in < 500 ms for reports with ≤1,000 rows.
- NFR-P-2: PDF generation for a 500-ticket report completes in < 10 seconds.
- NFR-P-3: Token verification completes in < 10 ms.

#### Availability
- NFR-A-1: 99.5% uptime SLA for production.
- NFR-A-2: Daily RDS snapshots with 35-day retention.
- NFR-A-3: Monthly restore drill.

#### Compliance
- NFR-C-1: SOC 2 Type 1 assessment complete by Month 6.
- NFR-C-2: DPA, privacy policy, and terms of service drafted and signed.
- NFR-C-3: Pen test (independent) completed by Month 5.
- NFR-C-4: Incident response plan documented and tested by Month 6.

### 5.7 Acceptance Criteria

| Criterion | Test |
|---|---|
| A client executive can click any KPI in a PDF and see the underlying data table | End-to-end test: generate overlay PDF → extract link → verify evidence page renders correct rows |
| A recipient cannot access data from a different report version | Token version-pinning test: v3 token fails on v4 manifest |
| A forwarded link does not authorise a second reader | Recipient-hash mismatch test: wrong email hash → denied + logged |
| An expired link fails closed | Token expiry test: expired token → denied + logged |
| A revoked link fails closed | Token revocation test: jti in revoked set → denied + logged |
| Audit log detects tampering | `npm run audit:verify` detects edit/delete/reorder |
| No JavaScript in generated PDF | `report.test.ts` asserts no `/JavaScript`, `/OpenAction`, or `javascript:` |
| Evidence rows never ship in PDF | `report.test.ts` asserts PDF contains only link annotations, not data |
| Original PDF preserved byte-for-byte | `overlay-sample.test.ts` asserts prefix bytes are identical |
| Every element has a click zone | Renderer asserts `linkCount === elements.length` |
| KPI row count matches headline value | `demo-fixture.test.ts` asserts 412-row KPI shows 412 rows |
| CSV export is formula-injection-safe | `EvidenceGrid.tsx` quote-prefixes dangerous cell prefixes |
| Weak signing secret throws | `token.test.ts` rejects <32-char secret |

### 5.8 Analytics Metrics (North Star)

- **Primary:** Time from report creation to client QBR value conversation (target: <30% of current manual time)
- **Secondary:** Click-through rate on report elements (target: >60% of recipients click ≥1 element)
- **Secondary:** Days between report publication and first evidence page access (target: <2 days)
- **Secondary:** Audit log completeness (target: 100% of accesses logged)
- **Retention:** Monthly churn (target: <2%); NRR (target: >110%)

---

## Appendix A: Reference Implementation Analysis (MSPBots Public Report)

**Note:** The "TinyFish MCP" referenced in the task instructions was not available in this environment. The reference implementation at `https://bi.mspbots.ai/publicReport?tk=...` was analyzed via direct HTTP request (curl) and cross-referenced against the existing `docs/01-research/mspbots-teardown.md`, which documents a 2026-07-26 observation of the same URL.

### A.1 Observed User Experience

The MSPBots public report is a **live, server-rendered interactive dashboard** (Vue.js SPA, v2.5.0), not a static PDF. Key observed features:

1. **No authentication required.** The link opens in a clean browser session with no credentials, no login, no cookies.
2. **Rich content displayed.** Report title naming the MSP and report subject; headline revenue KPI tiles; a detail grid with one row per sales opportunity (columns include ticket ID, assigned staff full name, ticket type, end-client organisation name, pipeline status, quotation flags, annualised opportunity value, profit); a multi-select filter listing 66 named staff members; aggregate counts of open/unworked/unprogressed opportunities.
3. **Interactive elements.** 23 occurrences of `drill` in the page markup. Multi-select filter control populated with real staff names.
4. **Export functionality.** `Export Options` present in the UI, exposed to the anonymous viewer.
5. **~43,000 characters** of rendered text in the page payload.

### A.2 Inferred UX Flow

Based on the markup and the teardown analysis:

1. User receives or finds the public link.
2. Page loads a full dashboard with KPI tiles, charts, and a detail grid.
3. User can filter by technician (multi-select with 66 named individuals).
4. User can drill through on chart elements to see underlying data.
5. User can export the data.

### A.3 Security Properties (Observed)

| Property | Status |
|---|---|
| Authentication required | **No** — opened in a clean session with no credentials |
| Bound to a recipient | **No** — token is in the query string; anyone holding the URL is authorised |
| Forward-resistant | **No** — forwarding the link forwards the access |
| Revocable | Unknown (not observable from reader side) |
| Expiring | Unknown (not observable in single session) |
| Watermarked with viewer identity | **No** — nothing viewer-specific rendered |
| Download/export restricted | **No** — `Export Options` exposed to anonymous viewer |
| Access logged and visible to MSP | Unknown (not observable from reader side) |

### A.4 RipoDoc's Differentiation Applied to This UX

If RipoDoc were to replicate this same report:

- The client would receive a **PDF** (familiar, printable, professional).
- Every chart and KPI in the PDF would have an invisible link annotation.
- Clicking a figure would open the evidence page scoped to **one recipient** — Dana Whitfield, not "anyone with the link."
- The evidence page would show **only the rows behind that one figure** — not the entire pipeline including other clients' margins.
- Every click and export would be recorded in the audit log.
- The MSP could revoke the link at any time, and a revoked link would fail closed.

The MSPBots report shows the data — arguably too much of it, to too many people. **RipoDoc's answer is not "more data on click" — it is "less data by default, more on demand, scoped per recipient, logged every time."**

---

## Appendix B: Current Codebase State

### B.1 What Ships Today

```
tools/evidence-pdf/
  src/pdf/              Dependency-free PDF 1.7 writer (141 lines, primitives.ts)
  src/render/           Report renderer (theme.ts: colour/layout constants)
  src/overlay/          Reader, text extraction, figure detection, incremental writer
    objects.ts          PDF object model + parser with span tracking (321 lines)
    fonts.ts            Font decoding: ToUnicode + encoding tables + CID widths (295 lines)
    geometry.ts          Visual space ↔ user space conversion, rotation/crop handling (152 lines)
    filters.ts           Flate/LZW/A85/AHx/RunLength decoders + PNG predictors (321 lines)
    locate.ts            Figure location and scoring
    plan.ts               Overlay planning + evidence link re-reading from trailer
    text.ts              Content-stream text operators (real text positioning)
    reader.ts            PDF xref stream parsing, object streams, incremental updates
    writer.ts            Incremental PDF update writer
  fixtures/             demo-report.json (412 tickets, 11 SLA breaches, 14 assets)
                        sample-customer-report.pdf (LibreOffice export)
                        sample-customer-report.placements.json
  test/                 127 tests (Node test runner)
                        token.test.ts       – HMAC token verify/fail-closed tests
                        manifest.test.ts    – manifest validation
                        overlay-*.test.ts   – overlay pipeline (reader, planner, writer, sample)
                        audit.test.ts       – hash-chain integrity
                        demo-fixture.test.ts – count-KPI row-count invariants
  scripts/              generate-demo-fixture.ts (deterministic 412-row generator)
  src/link/             base-url.ts + token.ts (evidence token minting, shared)
  src/cli.ts            Report generator CLI
  src/overlay-cli.ts    Overlay CLI (propose + publish)

web/frontend/
  src/app/
    page.tsx              Marketing home (SampleReport, competitor matrix, features)
    upload/page.tsx       Simulated PDF-only upload (BUG: fake progress, no handlers)
    e/[token]/page.tsx    Report index (all figures, recipient-bound)
    e/[token]/[elementId]/page.tsx  Evidence page (one figure, one version, one recipient)
    e/layout.tsx          Evidence layout (noindex, noarchive, nocache; light theme)
  src/components/
    Navbar.tsx            (labels "Upload PDF")
    Footer.tsx
    ReportViewer.tsx      Dead code (hardcoded mock data, never imported)
    evidence/EvidenceGrid.tsx  Searchable, sortable, paginated, CSV export
    marketing/SampleReport.tsx  In-page demo replica (hardcodes canExport=true)
  src/lib/evidence/
    types.ts              ReportManifest, ReportElement, EvidenceDetail, etc.
    store.ts              Read-only file-based manifest store
    manifest.ts           Manifest validator (rejects unknown kinds, bad ids, etc.)
    token.ts              HMAC-SHA256 token issue/verify/fail-closed
    clock.ts              Server clock seam
    config.ts             evidenceSecret(), revokedTokenIds(), exportsEnabled()
    audit.ts              recordAccess() (writes JSON to stdout or hash-chain file)
    audit-log.ts          verifyAuditLog() (hash-chain verification)
  content/reports/
    rpt-demo-0001.json    Demo manifest (412 tickets + SLA + assets)
  public/
    ripodoc-logo.png      Converted from Minimalist_modern_logo_design_2K_202608052204.jpeg
    (svg/globe/vercel/window icons from Next.js template)

tools/audit-log/
  verify-cli.ts           `ripodoc audit-verify` CLI (hash-chain integrity checker)

var/
  evidence-access.jsonl   Sample audit log (14 records, hash-chained)

docs/
  00-strategy/master-plan.md    Master plan (market, money, roadmap, anti-failure rules)
  01-research/competitor-map.md  Competitor analysis + positioning matrix
  01-research/market-evidence.md  Market size + source strength tags
  01-research/mspbots-teardown.md  Live MSPBots public report analysis
  02-product/prd.md              Product requirements (existing)
  02-product/interaction-spec.md  Click-to-evidence interaction design
  02-product/overlay-spec.md      Byte-preserving overlay guarantee
  02-product/api-contracts.md     API surface (planned Go backend)
  02-product/report-template-spec.md  Manifest shape + invariants
  04-security/threat-model.md     Threats + mitigations + absolute rules
  05-engineering/architecture.md  Service architecture, stack, decisions
  05-engineering/test-strategy.md  Test levels + trust-boundary tests
  05-engineering/deployment-runbook.md  CI/CD + operations (planned)

IDEA.md                    Narrative strategy, pricing, execution plan, anti-failure rules
.hermes.md                 Project context for agents (stack, conventions, structure)
implementation_plan.md     Existing authoring-studio code plan (NOT this analysis)
```

### B.2 What Ships vs. What's Planned

| Component | Shipped? | Tests | Notes |
|---|---|---|---|
| PDF engine | ✅ | 127 | Byte-verified, dependency-free |
| Overlay engine | ✅ | 127 | Byte-preserving, LibreOffice-tested |
| Token engine | ✅ | ✅ | HMAC-SHA256, fail-closed |
| Audit log | ✅ | ✅ | Hash-chained, verifiable |
| Evidence pages | ✅ | — | SSR, token-gated |
| Demo manifest | ✅ | ✅ | 412 rows, count-KPI invariant |
| Marketing site | ✅ | — | Live demo with SampleReport |
| Upload page | Partial | — | Simulated, PDF-only, no handlers |
| Go API backend | ❌ | — | Planned |
| PostgreSQL + RLS | ❌ | — | Planned |
| WorkOS auth | ❌ | — | Planned |
| Stripe billing | ❌ | — | Planned |
| AWS infrastructure | ❌ | — | Planned |
| Customer portal | ❌ | — | Planned (dashboard/ and security/ dirs empty) |
| RBAC | ❌ | — | Planned |
| Direct PSA/RMM connectors | ❌ | — | Deferred (Rule of Three) |
| AI agents | ❌ | — | Planned (assist-only, security tests not yet written) |

---

## Appendix C: Reconciliation of Pricing Discrepancies

The codebase contains three different pricing references:

1. **Original IDEA.md §12:** Founding Partner $750/mo, Core $1,250/mo, Scale $2,500+/mo.
2. **master-plan.md §2.3:** Founding Partner $499/mo (3 months upfront), Core $799/mo, Scale $1,499+/mo.
3. **master-plan.md §2.4:** ACV $6,000–$12,000/year, CAC $1,500–$3,000.

**The master-plan.md pricing (§2.3) is the correct one.** It incorporates the market evidence showing that $750–$2,500 is unsupportable as an additive purchase (category ceiling is $449/mo per ScalePad Cognition360, and Handover charges £49–£99/mo). The revised ladder positions RipoDoc as a displacement product (replacing BrightGauge or Cognition360) rather than an additive one.

The original IDEA.md pricing should be treated as superseded. All roadmap financial projections ($2,250 founding partner upfront, $7,500+ MRR by Month 6, 10 paying customers) align with the master-plan.md pricing, not the original IDEA.md pricing.

---

## Appendix D: Key Decisions and Recommendations

| Decision | Recommendation | Rationale |
|---|---|---|
| **Pricing** | Use $499 Founding Partner / $799 Core / $1,499 Scale (master-plan.md) | Original $750–2500 ladder contradicted by market research (category ceiling $449, Handover at £49–99) |
| **Lead with PDF overlay** | Position as "secure delivery + evidence layer" for existing tools | Overlay path makes "keep your tools" literally true; generating reports competes with MSPBots/BrightGauge |
| **AI agents** | Do not ship until 4 security tests pass (prompt injection, cross-tenant leakage, fabricated data, chart interpretation) | AI containment is the #1 existential risk per threat-model.md |
| **Integrations** | Ship PDF, CSV, generic REST only for 6 months | Rule of Three: no direct PSA/RMM connectors before 3+ paying customers request the same one |
| **MVP scope** | Ship: upload → extract → review → publish → share → click-to-data → audit | Anti-failure rule #9: everything else waits |
| **Customer portal** | Build in Phase 2 (Month 2–3) | Needed for 5-customer milestone; RBAC required for enterprise segment |
| **Dashboard builder** | Explicitly out of scope | "A full dashboard builder" is in the PRD exclusion list; would compete directly with Power BI/BrightGauge |
| **SOC 2** | Type 1 by Month 6, not Type 2 | Type 2 requires 6 months of operating history; Type 1 (point-in-time) is achievable in 6 months |
| **Bootstrap budget** | $34,000–$70,000 | Revenue offset: $6,750 upfront from 3 founding partners + $7,500 MRR by Month 6 |
| **First 10 customers** | Founder-led sales via 400-account outreach | 400 → 1,200 contacts → 50–80 replies → 30 calls → 15 demos → 10 paid (67% close rate) |

---

*Prepared by: Product Strategist & Technical Feasibility Analyst*
*Date: 2026-08-05*
*Based on codebase analysis (commit 9341043), docs/ reference materials, and live reference implementation review.*
*See: IDEA.md, docs/00-strategy/master-plan.md, docs/01-research/, docs/02-product/, docs/04-security/, docs/05-engineering/*
