<div align="center">

# 📄 RipoDoc — Secure Interactive Client Reports for MSPs

**A normal PDF where every figure is clickable.** Click a number in the report and the exact rows behind it open in your browser — scoped to one recipient, expiring, revocable, and logged.

Built for MSPs who send client reports and get asked *"where did that number come from?"*

</div>

```
┌─ The PDF (opens anywhere) ─────────┐        ┌─ The evidence page ──────────────┐
│                                    │        │  The 14 assets flagged at risk   │
│   412        97.4%       14        │        │  ────────────────────────────    │
│   Tickets    SLA         At risk ──┼──────► │  How this figure was calculated  │
│                          [VIEW DATA]        │  RMM — warranty_end < today …    │
│                                    │        │  ┌──────────────────────────┐    │
│   ▇▇  ▇▇▇  ▇▇▇  Ticket volume      │        │  │ HV-WKS-014  Workstation …│    │
│                                    │        │  │ HV-WKS-021  Workstation …│    │
└────────────────────────────────────┘        │  └──────────────────────────┘    │
                                               │  Approved by Priya Raman · logged│
                                               └──────────────────────────────────┘
```

<div align="center">

### ⭐ Star the repo if RipoDoc helps you build better client reports.

[![Stars](https://img.shields.io/github/stars/thecelestialmismatch/RipoDoc?style=social)](https://github.com/thecelestialmismatch/RipoDoc)
[![License](https://img.shields.io/badge/license-Proprietary-blue?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22.6-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/tests-127%20passing-brightgreen?style=flat-square)](#-testing)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

<div align="center">

<table>
  <tr>
    <td align="center"><a href="#-quick-start"><b>🚀 Quick Start</b></a></td>
    <td align="center"><a href="#-two-ways-in"><b>🎯 Two Modes</b></a></td>
    <td align="center"><a href="#-why-this-is-not-just-a-link"><b>🔗 Why It Works</b></a></td>
  </tr>
  <tr>
    <td align="center"><a href="#-security-model"><b>🔒 Security</b></a></td>
    <td align="center"><a href="#-ai-agent-strategy"><b>🤖 AI Agents</b></a></td>
    <td align="center"><a href="#-what-sets-ripodoc-apart"><b>🏆 What Sets Apart</b></a></td>
  </tr>
  <tr>
    <td align="center"><a href="#-technology-stack"><b>⚙️ Tech Stack</b></a></td>
    <td align="center"><a href="#-testing"><b>🧪 Testing</b></a></td>
    <td align="center"><a href="#-documentation"><b>📚 Docs</b></a></td>
  </tr>
</table>

</div>

<br/>

<div align="center">

## 🚀 Quick Start

</div>

```bash
# 1. Clone
git clone https://github.com/thecelestialmismatch/RipoDoc.git
cd RipoDoc

# 2. Install dependencies
npm install --prefix web/frontend

# 3. Set the evidence signing secret (32+ chars)
export RIPODOC_EVIDENCE_SECRET="$(openssl rand -base64 32)"

# 4. Run the full verification suite
npm run verify          # typecheck (web + tools) + 127 tests + production build

# 5. Start the evidence pages
npm run build:web && npm --prefix web/frontend run start   # http://localhost:3000

# 6. Generate a clickable PDF that points at them
npm run build:pdf:local                                     # build/demo-report.local.pdf
```

Open `build/demo-report.local.pdf` and **click any figure** — the exact rows behind it open in your browser.

<sub>Requires Node 22.6+ (native TypeScript execution via `--experimental-strip-types`).</sub>

<br/>

<div align="center">

## 🎯 Two Ways In

</div>

| Mode | What it does | When to use |
| :--- | :--- | :--- |
| **Overlay** | Takes **the PDF you already send** and appends a click zone to every figure | You keep your PSA, RMM, BI and report templates exactly as they are |
| **Generate** | Renders a report from a manifest | You want RipoDoc to produce the document too |

The **overlay path** is the one that matters commercially: it makes *"keep your existing tools"* literally true instead of a migration.

```bash
# Overlay: make an existing customer PDF clickable
npm run overlay:propose   # detect every figure, write a file to review
npm run overlay:sample    # publish the reviewed zones as a clickable PDF

# Generate: render a clickable report from scratch
npm run build:pdf          # uses the demo manifest
```

### The Overlay Guarantee

> **Your original file is a byte-for-byte prefix of the output.**

PDF is append-only by design (ISO 32000-1 §7.5.6), so RipoDoc adds objects at the end and chains a new cross-reference section back to yours. Nothing already in your document moves.

```bash
head -c "$(wc -c < original.pdf)" clickable.pdf | cmp - original.pdf && echo identical
```

That is checked on every run — the output is discarded if the prefix ever differs — and a test asserts the check fires when a byte is flipped. Detection proposes zones; a named person approves each one, bound to the PDF's SHA-256, before anything is published.

<br/>

<div align="center">

## 🔗 Why This Is Not Just a Link

</div>

Every interactive element carries a standard PDF **link annotation** (`/Annot /Subtype /Link` with a `/URI` action). That is the only PDF interaction mechanism supported by every viewer — Chrome, Safari, macOS Preview, Acrobat, iOS and Android.

| Viewer | Link Annotations | PDF JavaScript |
| :--- | :---: | :---: |
| Chrome built-in | ✅ | ❌ |
| Safari / macOS Preview | ✅ | ❌ |
| Firefox (PDF.js) | ✅ | partial |
| Adobe Acrobat | ✅ | ✅ |
| iOS / Android viewers | ✅ | ❌ |

Embedded PDF JavaScript, the obvious alternative, is **Acrobat-only**. In Chrome or on a phone it does nothing, silently. So RipoDoc does not use it, and a test asserts it never appears in the output.

**The rows themselves never travel inside the PDF.** Forwarding the file does not forward the data.

<sub>Full design, viewer compatibility matrix and rejected alternatives: [`docs/02-product/interaction-spec.md`](docs/02-product/interaction-spec.md)</sub>

<br/>

<div align="center">

## 🔒 Security Model

</div>

| Control | Mechanism |
| :--- | :--- |
| Recipient binding | Email is **hashed** into an HMAC-signed token, never embedded |
| Expiry | Signed into the token, checked on every request |
| Revocation | Per-link token id (`jti`) — kill one link without rotating the key |
| Version pinning | A token for v3 cannot open v4 |
| Scoped disclosure | One page renders **one element**, never the whole report |
| Audit | Every access, granted or denied, is recorded before rendering — hash-chained, so an edit is detectable |
| No indexing | Evidence routes are `noindex, noarchive, nocache` |
| Encrypted input | Refused, never re-saved without its protection |
| URI scheme | `https` only; `javascript:`, `file:` and `data:` are refused |
| Spreadsheet injection | CSV export quote-prefixes `=`, `+`, `-`, `@` cells |
| Weak secret | Signing refuses a secret under 32 characters; the app throws rather than falling back to a default |

### The Token

A token binds four claims under HMAC-SHA256: **report**, **version**, **recipient**, **expiry** — plus a `jti` for revocation. It is *not* a bearer secret lookup: the claims travel in the token and are verified, so a revoked or expired link fails closed without a round trip.

```
token = base64url(canonical_claims) . base64url(hmac_sha256(payload, secret))
```

- Signed with HMAC-SHA256; the separator `.` cannot appear in base64url, so claim boundaries are unambiguous.
- Compared with `timingSafeEqual` to avoid leaking the signature byte-by-byte.
- The recipient email is *hashed*, not embedded: a token that leaks must not also leak who it was for.

<sub>Full spec: [`docs/02-product/interaction-spec.md`](docs/02-product/interaction-spec.md) · [`docs/04-security/threat-model.md`](docs/04-security/threat-model.md)</sub>

### The Audit Chain

```
hash(n) = SHA-256( hash(n-1) ‖ canonical(record n) )
```

Each record commits to the one before it. Deleting a record, reordering two, or changing a single timestamp breaks the chain at that point and every point after it. That does not make the log *unmodifiable* — nothing on a writable disk is — it makes modification **detectable**, which is the honest claim and the one an auditor cares about.

```bash
npm run audit:verify   # reads RIPODOC_AUDIT_LOG, asserts hash chain integrity
```

<br/>

<div align="center">

## 🤖 AI Agent Strategy

</div>

> **AI agents are author assistants, not autonomous decision-makers.**

The reader's experience is **100% deterministic**. When a client clicks a chart, they see data that was approved by a human. AI never decides what a chart means at viewing time. AI never generates numbers. AI never publishes.

| Agent | Job | Allowed Output |
| :--- | :--- | :--- |
| **Extraction** | Finds report regions, tables, KPIs, chart candidates | Structured candidate elements with confidence + page coordinates |
| **Data-Mapping** | Maps CSV/API fields to report visuals and metric definitions | Proposed mappings for author approval |
| **Narrative** | Drafts executive summaries and QBR commentary | Editable draft with hyperlinked metric sources |
| **QA** | Reconciles totals, flags missing/contradictory data, detects unusual changes | Pre-publish warnings + review checklist |
| **Template** | Proposes report structure from approved MSP templates | Draft layout only |

### Hard Containment Rules

- Agents may read **only the current tenant/customer/report context**.
- All outputs are structured, source-linked suggestions — not facts until approved.
- Numerical calculations run through **deterministic SQL/data functions, never LLM arithmetic**.
- Agents **cannot**: publish reports, change access, send emails, export data, alter source systems, or bypass review.
- No customer-facing chat agent in the first 6 months.
- Model provider: DPA, no-training/no-retention terms for customer data, regional processing (AWS Bedrock / Azure OpenAI).
- Test before shipping: prompt injection inside uploaded PDFs, cross-tenant leakage, fabricated-data responses, malicious instructions, incorrect chart interpretation.

<sub>Full policy: [`docs/02-product/prd.md`](docs/02-product/prd.md) §AI Agent Policy · [`docs/04-security/threat-model.md`](docs/04-security/threat-model.md)</sub>

<br/>

<div align="center">

## 🏆 What Sets RipoDoc Apart

</div>

> Click-to-evidence is commodity **inside BI tools**. **Nobody delivers it from the PDF an MSP actually emails a client** — where the click survives the export, the email, the forward and the phone.

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

<sub>Full competitive analysis: [`docs/01-research/competitor-map.md`](docs/01-research/competitor-map.md) · [`docs/01-research/mspbots-teardown.md`](docs/01-research/mspbots-teardown.md)</sub>

<br/>

<div align="center">

## ⚙️ Technology Stack

</div>

| Layer | Technology | Version | Status |
| :--- | :--- | :--- | :--- |
| Frontend | Next.js / React / TypeScript / Tailwind | 16.2.12 / 19.2.4 / 5.9 / 4.1 | ✅ Shipped |
| PDF Engine | Hand-rolled, dependency-free TypeScript | — | ✅ Shipped (127 tests) |
| Overlay Engine | Byte-preserving incremental PDF update | — | ✅ Shipped |
| Token Engine | HMAC-SHA256, expiry, revocation, version pinning | — | ✅ Shipped |
| Audit Log | Hash-chained append-only, verifiable | — | ✅ Shipped |
| Evidence Pages | Next.js SSR, token-gated, searchable, sortable | — | ✅ Shipped |
| Demo Manifest | 412 tickets + SLA + assets, both fixture copies | — | ✅ Shipped |
| Backend API | Go + chi + pgx + sqlc | 1.24+ / v5.2.1 / v5.7.4 | ⏳ Planned |
| Database | PostgreSQL (RLS) | 18.4 | ⏳ Planned |
| Background Jobs | River (PostgreSQL-backed) | v0.16.2 | ⏳ Planned |
| OCR | AWS Textract | v2 API | ⏳ Planned |
| Auth | WorkOS / AuthKit | latest | ⏳ Planned |
| Billing | Stripe | v82 Go SDK | ⏳ Planned |
| Infrastructure | AWS ECS Fargate / RDS / S3 / KMS / CloudTrail / WAF | — | ⏳ Planned |
| CI/CD | GitHub Actions + Trivy + CodeQL + Gitleaks + Dependabot | — | ⏳ Planned |
| IaC | OpenTofu | latest | ⏳ Planned |
| Observability | OpenTelemetry + Sentry + PostHog | — | ⏳ Planned |

### Key Architectural Decisions

| Decision | Choice | Rationale |
| :--- | :--- | :--- |
| Monolith vs microservices | **Modular monolith** (Go API + isolated worker) | Solo founder. No distributed complexity. |
| PDF engine | Hand-rolled TS, not Go/pdfcpu | The shipped `tools/evidence-pdf` is byte-verified, dependency-free, and the security tests pin it. Port to Go later only if performance demands. |
| Multi-tenancy | Shared DB + PostgreSQL RLS | Simplest secure model. |
| Job queue | River (PostgreSQL) | No separate queue infrastructure. Transactional guarantees. |
| AI | AWS Bedrock / Azure OpenAI | DPA, no-training terms, regional processing. No customer chat in v1. |

<sub>Full architecture: [`docs/05-engineering/architecture.md`](docs/05-engineering/architecture.md)</sub>

<br/>

<div align="center">

## 🧪 Testing

</div>

| Level | What | Command |
| :--- | :--- | :--- |
| Unit | PDF primitives, token signing/verification, manifest validation, overlay planning/geometry/text | `npm test` (127 tests, Node test runner) |
| Integration | End-to-end overlay of a LibreOffice PDF (fixture), evidence link re-read from the trailer, byte-prefix preservation | `npm test` |
| Fixture integrity | Both copies of the demo manifest are identical; count-KPI row counts equal their headline values | `npm test` |
| Typecheck | TypeScript across web and tools | `npm run typecheck` |
| Lint | Next.js ESLint config | `npm run lint` |
| Build | Next.js production build (static route + SSR evidence pages) | `npm run build:web` |
| Audit chain | Append-only log: verify detects edit/delete/reorder | `npm run audit:verify` |

CI gate (`npm run verify`): typecheck → tests → web build. All must pass before merge.

### Trust-Boundary Tests (Non-Negotiable)

| Guard | Test |
| :--- | :--- |
| No embedded JavaScript | The generated PDF contains no `/JavaScript`, no `/OpenAction`, no `javascript:` URI |
| Evidence rows never ship in the PDF | The PDF contains only link annotations pointing at hosted evidence pages — never the rows themselves |
| Original document preserved | The overlaid output's first N bytes are byte-identical to the customer's original |
| Every element is clickable | The renderer asserts `linkCount === elements.length`; an element that lost its zone cannot be published |
| Links survive re-parsing | The finished file is re-read from its trailer — "we wrote N annotations" is not trusted; "a reader finds N annotations" is |
| Only https reaches an annotation | `javascript:`, `file:`, `data:` refused outright; loopback `http` requires an explicit opt-in |
| Encrypted PDFs are refused | `EncryptedPdfError` — RipoDoc refuses rather than silently stripping protection |
| No silent figure mismatch | KPI that claims 412 shows exactly 412 rows |
| Weak signing secrets throw | < 32-char secret fails closed |
| Token verification fails closed | Malformed/bad-signature/expired/revoked/wrong-report all reject without revealing internals |
| Audit chain tamper detection | `npm run audit:verify` detects edit, deletion, and reorder |
| Spreadsheet formula injection | CSV export quote-prefixes `=`, `+`, `-`, `@` cells |

<sub>Full strategy: [`docs/05-engineering/test-strategy.md`](docs/05-engineering/test-strategy.md)</sub>

<br/>

<div align="center">

## 📁 Project Layout

</div>

```
tools/evidence-pdf/
  src/pdf/             Dependency-free PDF 1.7 writer
  src/render/          Report renderer
  src/overlay/         Reader, text extraction, figure detection, incremental-update writer
  src/link/            Evidence token minting, shared by both generators
  fixtures/            Demo manifest + a real LibreOffice PDF for end-to-end tests
tools/audit-log/       Audit chain verifier
web/frontend/          Next.js app: recipient-bound evidence pages
  src/lib/evidence/    Manifest types, validation, tokens, audit chain, store
  src/app/e/           /e/<token> and /e/<token>/<elementId>
  src/components/      ReportViewer, EvidenceGrid, SampleReport
  content/reports/     Demo manifest (served statically)
docs/                  Strategy, research, product, security, engineering docs
IDEA.md                Strategy, market, pricing, execution plan
```

<br/>

<div align="center">

## 🔧 Environment Variables

</div>

| Variable | Required | Purpose |
| :--- | :--- | :--- |
| `RIPODOC_EVIDENCE_SECRET` | **yes** | HMAC key for evidence tokens. 32+ chars. No fallback — the app throws without it. |
| `RIPODOC_REVOKED_JTIS` | no | Comma-separated revoked token ids |
| `RIPODOC_ALLOW_EXPORT` | no | `false` disables CSV export for recipients |
| `RIPODOC_AUDIT_LOG` | no | Path to a hash-chained append-only access log. Unset means stdout only. |

<br/>

<div align="center">

## 📚 Documentation

</div>

| Document | What it covers |
| :--- | :--- |
| [`docs/00-strategy/master-plan.md`](docs/00-strategy/master-plan.md) | **The one document to run the company from**: market potential, money, first-10-customer plan, positioning, tech stack, security, six-month execution, and anti-failure rules. |
| [`docs/01-research/market-evidence.md`](docs/01-research/market-evidence.md) | Market size, MSP census data, source strength tags |
| [`docs/01-research/competitor-map.md`](docs/01-research/competitor-map.md) | Competitive landscape, positioning matrix, pricing benchmarks |
| [`docs/01-research/mspbots-teardown.md`](docs/01-research/mspbots-teardown.md) | Direct analysis of MSPBots' public report feature |
| [`docs/02-product/prd.md`](docs/02-product/prd.md) | Product requirements document |
| [`docs/02-product/interaction-spec.md`](docs/02-product/interaction-spec.md) | Click-to-evidence interaction design, viewer compatibility, rejected alternatives |
| [`docs/02-product/overlay-spec.md`](docs/02-product/overlay-spec.md) | Byte-preserving overlay guarantee, placement file format, scoring rules |
| [`docs/02-product/api-contracts.md`](docs/02-product/api-contracts.md) | API surface for the planned Go backend |
| [`docs/02-product/report-template-spec.md`](docs/02-product/report-template-spec.md) | Manifest shape, element types, evidence detail, invariants |
| [`docs/04-security/threat-model.md`](docs/04-security/threat-model.md) | Threats, mitigations, and absolute rules |
| [`docs/05-engineering/architecture.md`](docs/05-engineering/architecture.md) | Service architecture, stack, key decisions |
| [`docs/05-engineering/test-strategy.md`](docs/05-engineering/test-strategy.md) | Test levels, trust-boundary tests, fixture corpus |
| [`docs/05-engineering/deployment-runbook.md`](docs/05-engineering/deployment-runbook.md) | Deployment pipeline, CI/CD, operations, release gates |
| [`IDEA.md`](IDEA.md) | Full strategy: market analysis, competitive landscape, AI agent strategy, business model, customer acquisition, six-month execution plan, anti-failure rules |

<br/>

<div align="center">

## 📊 Status

</div>

**Pre-revenue, validation phase.**

The interaction and the overlay are implemented and verified end to end against both hand-built fixtures and a real word-processor PDF. Not built: the upload and review UI, PSA/RMM connectors, page rasterisation for a visual zone editor, and a database-backed manifest and audit store. Limits are listed explicitly in each spec.

| Component | Status |
| :--- | :--- |
| PDF generator with clickable link annotations | ✅ Shipped + 127 tests passing |
| Overlay engine (make an existing PDF clickable, byte-preserving) | ✅ Shipped + verified against a LibreOffice export |
| Hash-chained audit log + verifier | ✅ Shipped |
| Token engine (HMAC-SHA256, expiry, revocation, version pinning) | ✅ Shipped |
| Next.js evidence pages (token-gated, searchable, sortable, CSV export) | ✅ Shipped |
| Demo manifest (412 tickets + SLA + assets, both fixture copies) | ✅ Shipped — every count KPI enumerates its rows |
| Marketing page with interactive sample report | ✅ Shipped |
| Go API (`cmd/api`) | ⏳ Planned |
| Worker service (`cmd/worker`) | ⏳ Planned |
| PostgreSQL RLS + migrations | ⏳ Planned |
| Authoring UI (upload → review → publish) | ⏳ Planned |
| Customer portal + auth | ⏳ Planned |
| Billing (Stripe) | ⏳ Planned |
| AI agents | ⏳ Planned (assist-only) |
| AWS infrastructure + CI/CD | ⏳ Planned |

<br/>

<div align="center">

## 🔄 Keeping the Demo Honest

</div>

The demo manifest (`tools/evidence-pdf/fixtures/demo-report.json` + the served copy in `web/frontend/content/reports/`) is **generated**, not hand-edited. Every count KPI enumerates exactly the rows it claims — a KPI that reads 412 shows 412 rows, enforced by test. If you change the manifest:

```bash
npm run fixture:generate   # regenerate both copies deterministically
npm test                   # verify the count-KPI invariants still hold
```

Both copies are byte-identical by construction — the PDF generator and the web app can never disagree.

<br/>

<div align="center">

## 🛠️ Skills & Commands

</div>

> RipoDoc ships with a set of CLI skills and AI agent capabilities. Each skill has a single job, a deterministic output, and a test that pins it. Like [ponytail](https://github.com/DietrichGebert/ponytail), the rule is: **write only what the task needs, and never cut validation, error handling, security, or accessibility.**

### CLI Skills

| Command | What it does |
| :--- | :--- |
| `npm run verify` | Full verification: typecheck (web + tools) + 127 tests + production build. The CI gate — all must pass before merge. |
| `npm test` | Run the 127-test suite (Node test runner). Covers PDF primitives, tokens, manifest validation, overlay planning, audit chain. |
| `npm run typecheck` | TypeScript check across web + tools. Catches type errors before they reach CI. |
| `npm run lint` | ESLint with Next.js config. Enforces code quality across the frontend. |
| `npm run build:web` | Next.js production build. Produces the static marketing site + SSR evidence pages. |
| `npm run build:pdf` | Generate a clickable evidence PDF (https origin). Every figure gets a link annotation. |
| `npm run build:pdf:local` | Generate a clickable PDF for localhost (loopback http opt-in). For local dev and demos. |
| `npm run overlay:propose` | Detect every figure in a customer PDF and write a placement file for human review. |
| `npm run overlay:sample` | Publish the reviewed zones as a clickable PDF. Original bytes are a byte-for-byte prefix. |
| `npm run fixture:generate` | Regenerate the demo manifest deterministically. Both copies stay byte-identical. |
| `npm run audit:verify` | Verify the hash-chained audit log. Detects any edit, deletion, or reorder. |

### AI Agent Skills (Planned)

> **AI agents are author assistants, not autonomous decision-makers.** Each agent has a single job, a structured output, and zero authority over publication, access, or exports.

| Agent | Command (planned) | What it does |
| :--- | :--- | :--- |
| **Extraction** | `ripodoc extract` | Finds report regions, tables, KPIs, chart candidates. Output: structured candidate elements with confidence + page coordinates. |
| **Data-Mapping** | `ripodoc map` | Maps CSV/API fields to report visuals and metric definitions. Output: proposed mappings for author approval. |
| **Narrative** | `ripodoc narrate` | Drafts executive summaries and QBR commentary. Output: editable draft with hyperlinked metric sources. |
| **QA** | `ripodoc qa` | Reconciles totals, flags missing/contradictory data, detects unusual changes. Output: pre-publish warnings + review checklist. |
| **Template** | `ripodoc template` | Proposes report structure from approved MSP templates. Output: draft layout only. |

### The Development Ladder

Before writing code, the agent stops at the first rung that holds — the same philosophy as [ponytail](https://github.com/DietrichGebert/ponytail)'s ladder:

```
1. Does this need to exist?   → no: skip it (YAGNI)
2. Already in this codebase?  → reuse it, don't rewrite
3. Stdlib does it?            → use it
4. Native platform feature?   → use it
5. Installed dependency?      → use it
6. One line?                  → one line
7. Only then: the minimum that works
```

Lazy about the solution, never about reading. Lazy, not negligent: trust-boundary validation, data-loss handling, security, and accessibility are never on the chopping block.

### Agent Compatibility

RipoDoc's development workflow works with AI coding agents that respect `AGENTS.md`:

| Agent | How it works |
| :--- | :--- |
| **Claude Code** | Reads `AGENTS.md` from the repo root. Zero setup. |
| **Cline** | Reads `.clinerules/` or `AGENTS.md`. Copy the rules file. |
| **Cursor** | Reads `.cursor/rules/`. Copy the rules file. |
| **Copilot CLI** | Reads `AGENTS.md` and `.github/copilot-instructions.md`. |
| **Codex** | Reads `AGENTS.md` from the working directory. |
| **Any OpenAI-compatible tool** | Point at the evidence pages at `http://localhost:3000`. |


<br/>

<div align="center">

## 📄 License

</div>

Proprietary. See [LICENSE](LICENSE) for details.

<br/>

<div align="center">

## 🤝 Contributing

</div>

This is a solo-founder project in validation phase. Contributions are not currently open, but feedback is welcome via [GitHub Issues](https://github.com/thecelestialmismatch/RipoDoc/issues).

<br/>

---

<div align="center">

**RipoDoc** — *The secure reporting delivery and evidence layer for MSPs.*

Send a normal PDF. Every number is clickable.

</div>