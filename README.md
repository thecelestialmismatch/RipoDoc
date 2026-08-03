# RipoDoc

**A normal PDF where every figure is clickable.** Click a number in the report and the exact rows behind it open in your browser — scoped to you, expiring, revocable, and logged.

Built for MSPs who send client reports and get asked "where did that number come from?"

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

## Two ways in

|  | What it does | When |
| :--- | :--- | :--- |
| **Overlay** | Takes **the PDF you already send** and appends a click zone to every figure | You keep your PSA, RMM, BI and report templates exactly as they are |
| **Generate** | Renders a report from a manifest | You want RipoDoc to produce the document too |

The overlay path is the one that matters commercially: it makes "keep your existing tools" literally true instead of a migration.

```bash
npm run overlay:propose   # detect every figure in a customer PDF, write a file to review
npm run overlay:sample    # publish the reviewed zones as a clickable PDF
```

### The overlay guarantee

> **Your original file is a byte-for-byte prefix of the output.**

PDF is append-only by design, so RipoDoc adds objects at the end and chains a new cross-reference section back to yours. Nothing already in your document moves.

```bash
head -c "$(wc -c < original.pdf)" clickable.pdf | cmp - original.pdf && echo identical
```

That is checked on every run — the output is discarded if the prefix ever differs — and a test asserts the check fires when a byte is flipped. Detection proposes zones; a named person approves each one, bound to the PDF's SHA-256, before anything is published. Full design, scoring rules and limits: [`docs/02-product/overlay-spec.md`](docs/02-product/overlay-spec.md).

## Why this is not just a link

Every interactive element carries a standard PDF **link annotation** with an `https` URI action. That is the only PDF interaction mechanism supported by every viewer — Chrome, Safari, macOS Preview, Acrobat, iOS and Android.

Embedded PDF JavaScript, the obvious alternative, is **Acrobat-only**. In Chrome or on a phone it does nothing, silently. So RipoDoc does not use it, and a test asserts it never appears in the output.

The rows themselves never travel inside the PDF. Forwarding the file does not forward the data.

Full design, viewer compatibility matrix and rejected alternatives: [`docs/02-product/interaction-spec.md`](docs/02-product/interaction-spec.md).

## Security model

| Control | Mechanism |
| :--- | :--- |
| Recipient binding | Email is **hashed** into an HMAC-signed token, never embedded |
| Expiry | Signed into the token, checked on every request |
| Revocation | Per-link token id — kill one link without rotating the key |
| Version pinning | A token for v3 cannot open v4 |
| Scoped disclosure | One page renders **one element**, never the whole report |
| Audit | Every access, granted or denied, is recorded before rendering — hash-chained, so an edit is detectable |
| No indexing | Evidence routes are `noindex, noarchive, nocache` |
| Encrypted input | Refused, never re-saved without its protection |
| URI scheme | `https` only; `javascript:`, `file:` and `data:` are refused |

## Quick start

```bash
npm run verify          # typecheck (web + tools) + 120 tests + production build
```

Make an existing customer PDF clickable:

```bash
export RIPODOC_EVIDENCE_SECRET="$(openssl rand -base64 32)"

npm run overlay -- --pdf inbox/harbourview-q2.pdf \
  --manifest web/frontend/content/reports/rpt-demo-0001.json \
  --propose build/harbourview-q2.placements.json
# review every zone, add "approvedBy", then:
npm run overlay -- --pdf inbox/harbourview-q2.pdf \
  --manifest web/frontend/content/reports/rpt-demo-0001.json \
  --placements build/harbourview-q2.placements.json \
  --out build/harbourview-q2.clickable.pdf --origin https://ripodoc.com
```

Generate a clickable report from scratch:

```bash
RIPODOC_EVIDENCE_SECRET="$(openssl rand -base64 32)" npm run build:pdf
```

Run the evidence pages and generate a PDF that points at them:

```bash
echo "RIPODOC_EVIDENCE_SECRET=$(openssl rand -base64 32)" > web/frontend/.env.local
npm run build:web && npm --prefix web/frontend run start   # http://localhost:3000
npm run build:pdf:local                                     # build/demo-report.local.pdf
```

Open `build/demo-report.local.pdf` and click any figure.

Check an access log has not been altered:

```bash
npm run audit:verify -- --log var/evidence-access.jsonl
```

## Layout

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
docs/01-research/      Market evidence, competitor map, MSPBots teardown
docs/02-product/       PRD, interaction spec, overlay spec
IDEA.md                Strategy, market, pricing, execution plan
```

## Environment

| Variable | Required | Purpose |
| :--- | :--- | :--- |
| `RIPODOC_EVIDENCE_SECRET` | yes | HMAC key for evidence tokens. 32+ chars. No fallback — the app throws without it. |
| `RIPODOC_REVOKED_JTIS` | no | Comma-separated revoked token ids |
| `RIPODOC_ALLOW_EXPORT` | no | `false` disables CSV export for recipients |
| `RIPODOC_AUDIT_LOG` | no | Path to a hash-chained append-only access log. Unset means stdout only. |

## Status

Pre-revenue, validation phase. The interaction and the overlay are implemented and verified end to end against both hand-built fixtures and a real word-processor PDF. Not built: the upload and review UI, PSA/RMM connectors, page rasterisation for a visual zone editor, and a database-backed manifest and audit store. Limits are listed explicitly in each spec.

Requires Node 22.6+ (native TypeScript execution).

## Documentation

- [`docs/00-strategy/master-plan.md`](docs/00-strategy/master-plan.md) — **the one document to run the company from**: market potential, money, first-10-customer plan, positioning, tech stack, security, six-month execution, and anti-failure rules.
- [`docs/01-research/`](docs/01-research/) — market evidence, competitor map, MSPBots teardown
- [`docs/02-product/`](docs/02-product/) — PRD, interaction spec, overlay spec, API contracts, report template spec
- [`docs/04-security/threat-model.md`](docs/04-security/threat-model.md) — threats & mitigations
- [`docs/05-engineering/`](docs/05-engineering/) — architecture, test strategy, deployment runbook

### Keeping the demo honest

The demo manifest (`tools/evidence-pdf/fixtures/demo-report.json` + the served copy in `web/frontend/content/reports/`) is **generated**, not hand-edited. Every count KPI enumerates exactly the rows it claims — a KPI that reads 412 shows 412 rows, enforced by test. If you change the manifest:

```bash
npm run fixture:generate   # regenerate both copies deterministically
npm test                   # verify the count-KPI invariants still hold
```

Both copies are byte-identical by construction — the PDF generator and the web app can never disagree.
