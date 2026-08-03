# RipoDoc API Contracts (v0.1)

> The API surface for the planned Go backend, written before the backend so the
> frontend, the worker and the evidence pages all agree on one contract.
> Status: **Planned.** The evidence-token flow is implemented in
> `web/frontend/src/lib/evidence/token.ts`; the HTTP endpoints below are the
> contract the Go `cmd/api` service will implement.

## Conventions

- Base URL: `https://api.ripodoc.com/v1`
- Auth: `Authorization: Bearer <session>` (WorkOS-issued), except `/e/*` which carries the signed evidence token in the path.
- Tenant scope: every request is scoped by the authenticated user's tenant; the server never trusts client-supplied tenant ids.
- Errors: `{"error": {"code": "...", "message": "..."}}` — messages are recipient-safe (never distinguish a forged signature from an unknown report).
- All write endpoints are idempotent where marked.

---

## Evidence endpoints (implemented today)

### `GET /e/:token/:elementId`

The page a reader reaches when they click a figure in the PDF.

| Aspect | Contract |
| :--- | :--- |
| Token | HMAC-SHA256 signed. Binds report, version, recipient-hash, expiry, `jti`. |
| Element | Scoped to one element of one version. Row counts are enumerable (a KPI that claims 412 shows 412 rows). |
| Response | Server-rendered HTML with `noindex, noarchive, nocache` headers. Audit event written *before* render. |
| Failure | 404 with non-specific message: "This evidence link is not valid." |

Implemented: [`token.ts`](../../web/frontend/src/lib/evidence/token.ts) · [`types.ts`](../../web/frontend/src/lib/evidence/types.ts)

---

## Authoring endpoints (planned)

### `POST /reports`

Create a report draft.

```json
{
  "customerId": "cus_01HZ...",
  "title": "Quarterly Business Review",
  "periodLabel": "Q2 2026 · 1 Apr – 30 Jun"
}
```

Idempotency key: `Idempotency-Key: <uuid>`.

### `POST /reports/:id/sources`

Upload a source document (PDF/CSV).

| Field | Value |
| :--- | :--- |
| Content-Type | `application/pdf` or `text/csv` |
| Max size | 50 MB (PDF), 10 MB (CSV) |
| Response | `201` with `sourceId`, `sha256`, `accepted: true` |
| Async | Extraction result arrives via `GET /reports/:id/sources/:sourceId` polling or a webhook |

Rejected outright: encrypted PDFs (`EncryptedPdfError`), unsupported types, files containing executable constructs.

### `GET /reports/:id/elements`

List extracted candidate elements for the review queue.

```json
{
  "elements": [
    {
      "id": "assets-at-risk",
      "kind": "kpi",
      "label": "Assets at risk",
      "value": "14",
      "confidence": 0.87,
      "status": "pending",
      "page": 1,
      "rect": { "x": 218, "y": 107, "width": 37, "height": 33 },
      "matchedText": "14"
    }
  ]
}
```

### `PATCH /reports/:id/elements/:elementId`

Approve, correct, or reject an element. The **review gate** lives here.

```json
{
  "status": "approved",
  "approvedBy": "Priya Raman",
  "sourceRows": { "sourceId": "src_01HZ...", "query": "warranty_end < today" }
}
```

Rules: `approvedBy` is required. No element can reach a published version without it.

### `POST /reports/:id/publish`

Freeze an immutable version.

| Aspect | Contract |
| :--- | :--- |
| Input | Approves every P0 element OR marks it `visual-only`. |
| Response | `201` with `reportId`, `version`, `manifestUrl`, `pdfUrl` (generated clickable PDF), `sha256`. |
| Audit | `report.published` with version and author. |
| Invariant | A version cannot be edited after publish. A token for v3 cannot open v4. |

### `POST /reports/:id/versions/:version/share-links`

Mint a recipient-bound link.

```json
{
  "recipient": { "name": "Dana Whitfield", "email": "dana@acme.example" },
  "ttlDays": 14
}
```

Response: `201` with `token`, `link` (`/e/<token>/<elementId>`), `expiresAt`, `jti`.
Revocation: `DELETE /share-links/:jti`.

---

## Manual flow equivalent (implemented today)

Until `cmd/api` ships, the same pipeline runs on the CLI:

```bash
# 1. Propose placements (auto-detect zones)
npm run overlay -- --pdf inbox/report.pdf \
  --manifest web/frontend/content/reports/rpt-demo-0001.json \
  --propose build/report.placements.json

# 2. Publish (human-approved placements only)
npm run overlay -- --pdf inbox/report.pdf \
  --manifest web/frontend/content/reports/rpt-demo-0001.json \
  --placements build/report.placements.json \
  --out build/report.clickable.pdf --origin https://ripodoc.com
```

## Sources

- [`interaction-spec.md`](./interaction-spec.md) — token security model and viewer compatibility
- [`overlay-spec.md`](./overlay-spec.md) — byte-preserving overlay guarantee and placement file format
- [`threat-model.md`](../04-security/threat-model.md) — threats and mitigations