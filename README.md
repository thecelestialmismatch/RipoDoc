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
| Audit | Every access, granted or denied, is recorded before rendering |
| No indexing | Evidence routes are `noindex, noarchive, nocache` |

## Quick start

```bash
npm run verify          # typecheck + 52 tests + production build
```

Generate a clickable report:

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

## Layout

```
tools/evidence-pdf/     Dependency-free PDF 1.7 writer + report renderer + CLI
web/frontend/           Next.js app: recipient-bound evidence pages
  src/lib/evidence/     Manifest types, validation, tokens, audit, store
  src/app/e/            /e/<token> and /e/<token>/<elementId>
docs/01-research/       Market evidence, competitor map, MSPBots teardown
docs/02-product/        PRD and the interaction spec
IDEA.md                 Strategy, market, pricing, execution plan
```

## Environment

| Variable | Required | Purpose |
| :--- | :--- | :--- |
| `RIPODOC_EVIDENCE_SECRET` | yes | HMAC key for evidence tokens. 32+ chars. No fallback — the app throws without it. |
| `RIPODOC_REVOKED_JTIS` | no | Comma-separated revoked token ids |
| `RIPODOC_ALLOW_EXPORT` | no | `false` disables CSV export for recipients |

## Status

Pre-revenue, validation phase. The interaction is implemented and verified end to end; the authoring UI, PSA connectors, and overlaying links onto an **uploaded** PDF are not yet built — see the limitations section of the interaction spec.

Requires Node 22.6+ (native TypeScript execution).
