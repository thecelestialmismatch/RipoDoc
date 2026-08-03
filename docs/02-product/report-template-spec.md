# Report Template Spec (v0.1)

> Defines what a RipoDoc report manifest supports today, what the template
> system will support next, and the invariants every manifest must satisfy.
> Companion: [`interaction-spec.md`](./interaction-spec.md) §"The manifest".

---

## 1. Manifest shape (implemented)

`web/frontend/src/lib/evidence/types.ts` defines the contract. `manifest.ts`
validates it — unknown element kinds, duplicate element ids, non-URL-safe ids,
rows missing a declared column, a missing approver, and non-ISO approval
timestamps are all rejected.

### Top level

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `reportId` | string | ✅ | Stable, URL-safe. Immutable once published. |
| `version` | number | ✅ | Incremented on every publish. Versions are immutable. |
| `title` | string | ✅ | Shown in the PDF header and evidence page. |
| `provider` | string | ✅ | The MSP publishing the report. |
| `client` | string | ✅ | The end client. |
| `periodLabel` | string | ✅ | e.g. "Q2 2026 · 1 Apr – 30 Jun". |
| `publishedAt` | string | ✅ | ISO 8601. |
| `recipient` | object | ✅ | `{ name, email }` — email hashes into the evidence token. |
| `elements` | array | ✅ | 1–N elements. |

### Element

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `id` | string | ✅ | Stable, URL-safe. Appears in the evidence URL — never change it. |
| `kind` | `"kpi" \| "bar-chart" \| "claim"` | ✅ | Line/pie charts are not implemented. |
| `label` | string | ✅ | Rendered as the element's title. |
| `value` | string | — | Pre-formatted headline for `kpi`, e.g. `"$89,125"` or `"97.4%"`. |
| `caption` | string | — | Supporting copy under a KPI or the sentence for a `claim`. |
| `series` | array | for `bar-chart` | `[{ label, value }]` — the drawn bars. |
| `evidence` | object | ✅ | See below. **Every element carries approved evidence.** |

### Evidence detail

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `title` | string | ✅ | Evidence page heading. |
| `summary` | string | ✅ | One-line context: what this table is. |
| `table.columns` | array | ✅ | `[{ key, label, align? }]` — key is the row property. |
| `table.rows` | array | ✅ | Objects matching `columns[].key`. |
| `provenance.sourceSystem` | string | ✅ | e.g. "PSA — ticket export". |
| `provenance.sourceQuery` | string | ✅ | The honest equivalent of a BI filter expression. |
| `provenance.approvedBy` | string | ✅ | Named human — the review gate. |
| `provenance.approvedAt` | string | ✅ | ISO 8601. |

### Invariants (enforced by validation + tests)

1. Element ids are URL-safe and unique.
2. Every row has every declared column (missing keys reject the manifest).
3. A whole-number KPI's evidence table lists **exactly that many rows** — a KPI that claims 412 shows 412 rows (`demo-fixture.test.ts` pins this for the shipped demo).
4. `provenance.approvedBy` is present — an unapproved element must never reach a client.
5. A `bar-chart` element's `series` total equals the sum of its evidence rows where applicable.

---

## 2. Template system (planned)

After the authoring UI ships, a **template** is a reusable shell:

- Branding: provider name, colours, fonts, logo
- Sections: ordered list of section blocks (KPI row, bar chart, claim, table, narrative)
- Placeholders: each block references a **metric definition** (e.g. `tickets-resolved = COUNT(tickets) WHERE status = closed`) rather than a literal value
- Approval: the template's metric definitions MUST still pass the review gate — a template speeds up authoring, it never bypasses approval

### Metric definition (planned)

```json
{
  "metricId": "tickets-resolved",
  "kind": "kpi",
  "label": "Tickets resolved",
  "definition": {
    "sourceSystem": "psa",
    "query": "status = closed AND closed_at BETWEEN :period_start AND :period_end",
    "aggregate": "count"
  }
}
```

The QA agent reconciles the rendered value against the deterministic query
result — LLM arithmetic is never used for numerical output.

---

## 3. Overlay placements (implemented)

When the report is an **existing PDF** the MSP already sends, the placements
file binds a manifest element to a rectangle on a specific page of one exact
document:

```json
{
  "reportId": "rpt-demo-0001",
  "version": 3,
  "pdfSha256": "e19fd6e8…",
  "placements": [
    {
      "elementId": "assets-at-risk",
      "page": 1,
      "rect": { "x": 218, "y": 107, "width": 37, "height": 33 },
      "matchedText": "14",
      "approvedBy": "Priya Raman",
      "approvedAt": "2026-07-02T09:10:00Z"
    }
  ]
}
```

Rules:

- `rect` is in **visual space** (top-left origin, points).
- `pdfSha256` binds the coordinates to one document — a re-export shifts the layout and invalidates the placement.
- `approvedBy` is required; publication refuses unreviewed placements.
- The finished PDF must re-parse to exactly the expected links (`readEvidenceLinks` re-reads from the trailer).

Full spec: [`overlay-spec.md`](./overlay-spec.md)

---

## 4. Known limitations

- **One page** for generated reports. Multi-page pagination is not implemented.
- **KPIs and bar charts only.** Line and pie charts are not implemented.
- **Visual placement editing is not built** — placements are reviewed as JSON.
- **Manifests are files on disk** — `store.ts` is a read-only lookup with the interface a database implementation would replace.