# Interaction Spec — Click-to-Evidence in a PDF

**Status:** implemented and verified. Generator: `tools/evidence-pdf/`. Evidence pages: `web/frontend/src/app/e/`.

## The interaction

> *"You claimed 14 assets were at risk. Show me the 14."*
> Click the figure in the PDF. A browser window opens with exactly those 14 rows, the query that produced them, and who approved them.

The PDF can be one RipoDoc rendered from a manifest, or **the customer's own report with links appended to it** ([`overlay-spec.md`](overlay-spec.md)) — the second is what makes "keep your existing tools" true.

This is the interaction MSPBots offers inside its web dashboard — click a KPI, get a modal with a filter expression and a paginated grid ([`../01-research/mspbots-teardown.md`](../01-research/mspbots-teardown.md)). RipoDoc's difference is **where it lives**: not in a dashboard the client must visit, but in the PDF the MSP already emails them.

## Why this is hard, and how it is solved

A PDF cannot show a data table on click by itself. The mechanism has to be chosen carefully, because most of the obvious options do not survive contact with real viewers.

### Rejected: embedded PDF JavaScript

PDF supports JavaScript actions (`/S /JavaScript`), including dialogs. **Adobe Acrobat is effectively the only viewer that runs it.** Chrome's built-in PDF viewer does not support JavaScript; Safari and macOS Preview do not; mobile viewers do not.

A JS-driven popup would therefore do *nothing* for most recipients — the worst possible failure, because it fails silently and the MSP cannot tell.

> Enforced by test: `report.test.ts` → *"the PDF carries no embedded JavaScript"* asserts the output contains no `/JavaScript`, no `/OpenAction`, and no `javascript:` URI.

### Rejected: embedded file attachments

A PDF can embed a CSV as an attachment. Viewers either hide attachments entirely or hand them to the OS. There is no table UI, no scoping, no expiry, and no way to log access.

### Rejected: rendering the rows into the PDF

Simplest to build, and it destroys the security model: the rows would travel with the file, so forwarding the PDF forwards all the data. That is the exact failure mode of the unauthenticated link that inspired this product.

> Enforced by test: `report.test.ts` → *"the evidence rows themselves are never embedded in the PDF"*.

### Chosen: link annotations with an `https` URI action

Every interactive element carries a standard PDF link annotation:

```
<< /Type /Annot /Subtype /Link
   /Rect [x0 y0 x1 y1]
   /Border [0 0 0]
   /F 4
   /A << /S /URI /URI (https://ripodoc.com/e/<token>/<elementId>) >> >>
```

`http`, `https` and `mailto` URI actions are supported across all major browsers and viewers. This is the one PDF interaction mechanism that works everywhere.

| Property | Choice | Reason |
| :--- | :--- | :--- |
| `/Border [0 0 0]` | Invisible | Otherwise every figure is outlined in blue |
| `/F 4` | Print flag | Annotation survives printing without becoming visible |
| `/Rect` | Bottom-left origin | PDF user space is inverted relative to the layout API; the renderer converts once |
| Scheme | `https` only | A report that gets emailed must never carry an unencrypted link. `javascript:` and `file:` are refused outright |

Loopback `http` is permitted **only** for `localhost`/`127.0.0.1`/`::1`, and only behind an explicit `allowLoopbackHttp` opt-in, so local development works without weakening the shipped artifact.

### Viewer compatibility

| Viewer | Link annotations | PDF JavaScript |
| :--- | :---: | :---: |
| Chrome built-in | ✅ | ❌ |
| Safari / macOS Preview | ✅ | ❌ |
| Firefox (PDF.js) | ✅ | partial |
| Adobe Acrobat | ✅ | ✅ |
| iOS / Android viewers | ✅ | ❌ |

Verified directly: the generated demo PDF renders and its annotations are present in Chrome's viewer.

## Determinism — the rule that makes this trustworthy

**Nothing is computed at view time.** The evidence page renders rows that a human approved before publication, stored in the report manifest.

- AI may *propose* an element and its rows during authoring.
- A human approves it; `provenance.approvedBy` and `approvedAt` are recorded.
- Publication freezes the version. Published versions are immutable.
- A click reads approved rows. No model, no query, no arithmetic runs on the read path.

This is why the reader experience carries no hallucination risk, and why `IDEA.md` §8 restricts agents to author assistance.

## The manifest

`web/frontend/src/lib/evidence/types.ts` defines the contract between the PDF, the evidence page, and the audit record. Validation lives in `manifest.ts` and rejects, among others: unknown element kinds, duplicate element ids, ids that are not URL-safe, rows missing a declared column, a missing approver, and a non-ISO approval timestamp.

Element ids appear in URLs, so they are immutable once published.

## Security model of an evidence link

The token binds four claims under HMAC-SHA256: report, version, recipient, expiry — plus a `jti` for revocation.

| Control | Mechanism |
| :--- | :--- |
| Recipient binding | Recipient email is **hashed** into the token, never embedded — a leaked token does not reveal who it was for |
| Expiry | `expiresAt` in the signed payload; checked exclusively at the boundary |
| Revocation | `jti` checked against a revocation list; kills one link without rotating the key |
| Version pinning | A token for v3 cannot open v4; superseded versions fail closed |
| Tamper resistance | Signature compared with `timingSafeEqual` |
| Scoped disclosure | A page renders **one element** of one version — never the whole report's data |
| Audit | Every access, granted or denied, is recorded **before** rendering |
| Indexing | Evidence routes are `noindex, noarchive, nocache` — a cached copy would outlive revocation |
| Weak secret | Signing refuses a secret under 32 characters; the app throws rather than falling back to a default |

Failure messages shown to recipients are deliberately non-specific ("This evidence link is not valid") so they do not distinguish a forged signature from an unknown report.

## What the recipient sees

1. **Header** — provider, period, the element's title and summary.
2. **"How this figure was calculated"** — source system and the query. This is the honest equivalent of the `Filter: where (...)` line MSPBots shows.
3. **The grid** — searchable, sortable, paginated, with CSV export when the provider allows it. CSV fields beginning `=`, `+`, `-` or `@` are quote-prefixed so an exported row cannot execute as a spreadsheet formula.
4. **Provenance footer** — who approved it and when, the immutable version, the expiry, and a statement that access is logged.

## Generating a report

```bash
RIPODOC_EVIDENCE_SECRET="<32+ chars>" \
node --experimental-strip-types tools/evidence-pdf/src/cli.ts \
  --manifest tools/evidence-pdf/fixtures/demo-report.json \
  --out build/demo-report.pdf \
  --origin https://ripodoc.com \
  --ttl-days 14
```

In production the application server mints the token and passes `--base-url`; the generator then never touches the signing key. The document id is derived from `sha256(manifest + baseUrl)`, so the same inputs always produce the same bytes — which is what makes "this is the version we published" checkable rather than a promise.

The renderer asserts `linkCount === elements.length` before returning. A report where one figure silently lost its click zone cannot be produced.

## Known limitations

- **One page.** Multi-page pagination is not implemented; a manifest with many elements will overflow. The renderer does not yet detect this.
- **Bar charts and KPIs only.** Line and pie charts are not implemented.
- **Overlaying an existing uploaded PDF is implemented** — see [`overlay-spec.md`](overlay-spec.md). A customer's PDF is left byte-for-byte intact and the annotations are appended as an incremental update. What is *not* built is the visual authoring UI: zones are reviewed as JSON rather than by dragging a box over a rendered page.
- **Manifests are files on disk.** `store.ts` is a read-only lookup with the interface a database implementation would replace.
- **The audit sink writes structured JSON to stdout**, and — when `RIPODOC_AUDIT_LOG` is set — a hash-chained append-only file (`audit-log.ts`, verifiable with `npm run audit:verify`). A database-backed sink is not implemented.
