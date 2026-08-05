# Implementation Plan

## [Overview]

Transform RipoDoc from a PDF-only upload demo into a full self-serve report authoring studio where customers upload any reporting file (PDF, DOC/DOCX, CSV, XLSX, TXT, images), declare the data source, choose how to visualise each field via drag-and-drop mapping, and have all data processed and stored in a local Docker container so nothing ever leaves their machine.

The current product is a Next.js 16.2 application with a marketing page, a simulated PDF-only upload page, token-gated evidence pages, a file-based manifest store, and a hand-rolled PDF engine. The upload page (`web/frontend/src/app/upload/page.tsx`) currently accepts only PDFs and simulates upload progress with `setInterval` — there is no real file processing, no data extraction, no field mapping, no visualisation selection, and no persistence. The evidence pages (`/e/[token]` and `/e/[token]/[elementId]`) are fully functional and token-gated, driven by a validated `ReportManifest` type. The manifest store (`web/frontend/src/lib/evidence/store.ts`) reads from `content/reports/` on disk. The audit system (`web/frontend/src/lib/evidence/audit.ts` + `audit-log.ts`) writes hash-chained append-only records.

This implementation adds: (1) a multi-format upload experience with client-side parsing for CSV/XLSX/TXT and preview for PDF/DOC/DOCX/images, (2) a source-system declaration step, (3) a drag-and-drop field-mapping canvas where customers bind source columns to report elements (KPI, bar chart, line chart, table, claim), (4) a visualisation picker with live preview, (5) a local Docker container (`ripodoc-local`) that persists drafts, source files, and manifests on the customer's machine via a mounted volume — the browser never sends data to a third-party server, (6) the new brand logo integrated across the Navbar, Footer, marketing hero, and upload page, and (7) a Vercel deployment with a GitHub PR.

The approach is to keep the existing token/evidence/audit architecture intact and layer the authoring studio on top. The manifest contract (`ReportManifest`) is extended with new element kinds (`line-chart`, `table`) and a `source` declaration, while remaining backward-compatible with the existing demo manifest. The local Docker container exposes a minimal HTTP API (`http://localhost:8787`) that the Next.js app calls via server-side route handlers (`/api/local/...`), so the browser only ever talks to the same-origin Next.js server, which proxies to the local container. This preserves the "data never leaves the machine" guarantee while keeping the deployment story simple. The logo file `Minimalist_modern_logo_design_2K_202608052204.jpeg` (2048×2048) has been converted to `web/frontend/public/ripodoc-logo.png` and integrated into the Navbar, Footer, marketing hero, and upload page header.

## [Types]

Extend the existing manifest type system in `web/frontend/src/lib/evidence/types.ts` with new element kinds, a source declaration, and a field-mapping contract, while keeping all existing types backward-compatible.

### New types

```ts
// web/frontend/src/lib/evidence/types.ts (additions)

/** Supported upload formats. */
export type UploadFormat =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'csv'
  | 'xlsx'
  | 'txt'
  | 'png'
  | 'jpg'
  | 'jpeg';

/** Where the data came from — declared by the customer at upload time. */
export interface DataSource {
  /** e.g. "PSA — ConnectWise Manage", "RMM — NinjaOne", "Excel export". */
  readonly system: string;
  /** Free-text description of the source, e.g. "Ticket export, Q2 2026". */
  readonly description: string;
  /** Optional connection detail, e.g. "API v2", "manual export". */
  readonly method?: string;
  /** ISO 8601 timestamp of when the source was captured. */
  readonly capturedAt: string;
}

/** A parsed column from an uploaded data file. */
export interface SourceColumn {
  /** Stable id, e.g. "col-0". */
  readonly id: string;
  /** Original header text from the file. */
  readonly header: string;
  /** Inferred type from the first N non-empty rows. */
  readonly dataType: 'string' | 'number' | 'date' | 'boolean';
  /** Sample values for preview (max 5). */
  readonly sampleValues: readonly string[];
}

/** A parsed data file ready for mapping. */
export interface ParsedSourceFile {
  readonly fileId: string;
  readonly fileName: string;
  readonly format: UploadFormat;
  readonly sizeBytes: number;
  readonly columns: readonly SourceColumn[];
  /** First 50 rows for preview. */
  readonly previewRows: readonly Readonly<Record<string, string>>[];
  readonly rowCount: number;
  readonly source: DataSource;
}

/** How a mapped field should be visualised. */
export type VisualizationKind = 'kpi' | 'bar-chart' | 'line-chart' | 'table' | 'claim';

/** A single drag-and-drop field binding. */
export interface FieldMapping {
  /** Stable id, e.g. "map-1". */
  readonly id: string;
  /** The source column id this mapping reads from. */
  readonly columnId: string;
  /** What the customer wants this field to become. */
  readonly visualization: VisualizationKind;
  /** Display label, defaults to the column header. */
  readonly label: string;
  /** For kpi: pre-formatted value, e.g. "$89,125". */
  readonly format?: string;
  /** For bar-chart/line-chart: the label column id (x-axis). */
  readonly categoryColumnId?: string;
  /** For bar-chart/line-chart: the value column id (y-axis). */
  readonly valueColumnId?: string;
  /** For claim: the sentence template with {column} placeholders. */
  readonly claimTemplate?: string;
}

/** A complete authoring draft before it becomes a ReportManifest. */
export interface ReportDraft {
  readonly draftId: string;
  readonly title: string;
  readonly provider: string;
  readonly client: string;
  readonly periodLabel: string;
  readonly recipient: ReportRecipient;
  readonly source: DataSource;
  readonly files: readonly ParsedSourceFile[];
  readonly mappings: readonly FieldMapping[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
```

### Extended `ElementKind`

```ts
export type ElementKind = 'kpi' | 'bar-chart' | 'line-chart' | 'table' | 'claim';
```

### Extended `ReportElement`

```ts
export interface ReportElement {
  readonly id: string;
  readonly kind: ElementKind;
  readonly label: string;
  readonly value?: string;
  readonly caption?: string;
  readonly series?: readonly BarDatum[];
  /** For line-chart: ordered (x, y) points. */
  readonly lineSeries?: readonly { readonly label: string; readonly value: number }[];
  /** For table: the full column set to render. */
  readonly tableColumns?: readonly EvidenceColumn[];
  readonly evidence: EvidenceDetail;
}
```

### Extended `ReportManifest`

```ts
export interface ReportManifest {
  readonly reportId: string;
  readonly version: number;
  readonly title: string;
  readonly provider: string;
  readonly client: string;
  readonly periodLabel: string;
  readonly publishedAt: string;
  readonly recipient: ReportRecipient;
  /** New: where the data came from. Optional for backward compatibility. */
  readonly source?: DataSource;
  readonly elements: readonly ReportElement[];
}
```

### Validation updates (`web/frontend/src/lib/evidence/manifest.ts`)

- Accept `'line-chart'` and `'table'` in the `kind` switch.
- Validate `lineSeries` for `line-chart` (non-empty, finite numbers, non-negative).
- Validate `tableColumns` for `table` (non-empty, unique keys).
- Validate `source` when present (system and description non-empty, capturedAt ISO 8601).
- Keep all existing invariants intact — no existing manifest may fail validation.

## [Files]

Create new authoring-studio components, a local Docker service, and extend the existing manifest/upload infrastructure.

### New files

| Path | Purpose |
| :--- | :--- |
| `web/frontend/src/lib/upload/parsers.ts` | Client-side file parsers: CSV (RFC 4180 manual parser), XLSX (SheetJS via dynamic import), TXT (line splitter), and format detection for PDF/DOC/DOCX/images. Returns `ParsedSourceFile`. |
| `web/frontend/src/lib/upload/format.ts` | `detectFormat(file: File): UploadFormat`, `isSupportedFormat(name: string): boolean`, `formatLabel(format: UploadFormat): string`, `formatIcon(format: UploadFormat): string`. |
| `web/frontend/src/lib/upload/infer.ts` | `inferColumnType(values: readonly string[]): 'string' \| 'number' \| 'date' \| 'boolean'`, `sampleValues(values: readonly string[], max = 5): readonly string[]`. |
| `web/frontend/src/lib/upload/draft.ts` | `createDraft(input): ReportDraft`, `updateDraft(draft, patch): ReportDraft`, `draftToManifest(draft): ReportManifest` — converts a completed draft into a validated manifest. |
| `web/frontend/src/lib/upload/validation.ts` | `validateDraft(draft): readonly string[]` — returns human-readable errors (missing mappings, unmapped columns, empty visualisations). |
| `web/frontend/src/components/upload/UploadDropzone.tsx` | Reusable multi-format drag-and-drop zone with per-file status, format badges, and size limits. |
| `web/frontend/src/components/upload/FilePreview.tsx` | Inline preview for CSV/XLSX/TXT (first 10 rows table) and PDF/DOC/DOCX/images (thumbnail or "preview not available" card). |
| `web/frontend/src/components/upload/SourceForm.tsx` | Form for declaring the data source: system name, description, method, captured-at date. |
| `web/frontend/src/components/upload/VisualizationPicker.tsx` | Card grid of visualisation options (KPI, bar chart, line chart, table, claim) with icons and one-line descriptions. |
| `web/frontend/src/components/upload/FieldMappingCanvas.tsx` | Drag-and-drop canvas: source columns on the left, visualisation targets on the right. Uses native HTML5 drag-and-drop (no new dependency). |
| `web/frontend/src/components/upload/MappingCard.tsx` | A single mapping row: column selector, visualisation selector, label input, and per-kind options (format, category column, value column, claim template). |
| `web/frontend/src/components/upload/ReportPreview.tsx` | Live preview of the assembled report using the existing `SampleReport`-style rendering, driven by `draftToManifest(draft)`. |
| `web/frontend/src/components/upload/AuthoringWizard.tsx` | Multi-step wizard orchestrating: 1) Upload files → 2) Declare source → 3) Map fields → 4) Preview → 5) Publish. |
| `web/frontend/src/app/api/local/route.ts` | Next.js route handler that proxies authoring requests to the local Docker container (`http://localhost:8787`). |
| `web/frontend/src/app/api/local/drafts/route.ts` | `GET` list drafts, `POST` create draft — proxied to the local container. |
| `web/frontend/src/app/api/local/drafts/[id]/route.ts` | `GET`/`PUT`/`DELETE` a single draft — proxied to the local container. |
| `web/frontend/src/app/api/local/publish/route.ts` | `POST` publish a draft — writes the manifest into `content/reports/` and returns the report id + evidence token. |
| `docker/local/Dockerfile` | Multi-stage Node 22 image running a minimal HTTP server for the local data store. |
| `docker/local/server.mjs` | Zero-dependency Node HTTP server: persists drafts, source files, and manifests to a mounted volume (`/data`). |
| `docker/local/package.json` | `{ "name": "ripodoc-local", "type": "module" }` — no dependencies. |
| `docker/local/README.md` | How to run the local container: `docker build -t ripodoc-local docker/local && docker run -p 8787:8787 -v ripodoc-data:/data ripodoc-local`. |
| `docker-compose.yml` | Root-level compose file for the local container. |
| `web/frontend/public/ripodoc-logo.png` | Converted PNG of `Minimalist_modern_logo_design_2K_202608052204.jpeg` — integrated into Navbar, Footer, marketing hero, and upload page. |
| `web/frontend/src/lib/upload/__tests__/parsers.test.ts` | Unit tests for CSV/TXT parsing, format detection, and column inference. |
| `web/frontend/src/lib/upload/__tests__/draft.test.ts` | Unit tests for draft creation, update, and manifest conversion. |
| `web/frontend/src/lib/upload/__tests__/validation.test.ts` | Unit tests for draft validation rules. |
| `docs/02-product/authoring-spec.md` | Product spec for the authoring studio: steps, field mapping rules, visualisation options, local-storage privacy model. |
| `docs/05-engineering/local-docker.md` | Engineering doc for the local Docker container: API surface, volume layout, security model. |

### Modified files

| Path | Change |
| :--- | :--- |
| `web/frontend/src/app/upload/page.tsx` | Replace the simulated PDF-only upload with the full `AuthoringWizard`. Keep the page shell, header, and info cards. |
| `web/frontend/src/lib/evidence/types.ts` | Add `UploadFormat`, `DataSource`, `SourceColumn`, `ParsedSourceFile`, `VisualizationKind`, `FieldMapping`, `ReportDraft`. Extend `ElementKind`, `ReportElement`, `ReportManifest`. |
| `web/frontend/src/lib/evidence/manifest.ts` | Accept `'line-chart'` and `'table'` kinds. Validate `lineSeries`, `tableColumns`, and optional `source`. |
| `web/frontend/src/lib/evidence/store.ts` | Add `saveManifest(manifest: ReportManifest): Promise<void>` — writes a validated manifest to `content/reports/`. |
| `web/frontend/src/components/marketing/SampleReport.tsx` | Render `line-chart` and `table` elements in the demo. |
| `web/frontend/src/app/e/[token]/page.tsx` | Add `line-chart` and `table` to `KIND_LABEL`. |
| `web/frontend/src/app/page.tsx` | Update the "Upload your PDF" copy to "Upload your data" and mention multi-format support. |
| `web/frontend/src/components/Navbar.tsx` | Change "Upload PDF" label to "Create report". |
| `web/frontend/package.json` | Add `xlsx` dependency. |
| `package.json` | Add `docker:build`, `docker:run`, `docker:stop` scripts. |
| `README.md` | Document the authoring studio, local Docker container, and multi-format upload. |
| `docs/05-engineering/test-strategy.md` | Add the new upload/draft/validation tests to the test matrix. |
| `docs/05-engineering/deployment-runbook.md` | Document the local Docker container as a dev dependency, not a Vercel deployment target. |

### Files to delete or move

| Path | Action |
| :--- | :--- |
| `Minimalist_modern_logo_design_2K_202608052143.jpeg` | Copy to `web/frontend/public/logo.png` (converted). Keep the original at repo root for reference. |

## [Functions]

Add parsing, inference, draft-management, and local-container functions; modify the manifest validator and store.

### New functions

| Function | Signature | File | Purpose |
| :--- | :--- | :--- | :--- |
| `detectFormat` | `(file: File) => UploadFormat` | `web/frontend/src/lib/upload/format.ts` | Detect format from MIME type and file extension. |
| `isSupportedFormat` | `(name: string) => boolean` | `web/frontend/src/lib/upload/format.ts` | Reject unsupported file types before parsing. |
| `formatLabel` | `(format: UploadFormat) => string` | `web/frontend/src/lib/upload/format.ts` | Human-readable label, e.g. "Excel workbook". |
| `formatIcon` | `(format: UploadFormat) => string` | `web/frontend/src/lib/upload/format.ts` | Lucide icon name for the format badge. |
| `parseCsv` | `(text: string) => readonly string[][]` | `web/frontend/src/lib/upload/parsers.ts` | RFC 4180 CSV parser handling quoted fields, escaped quotes, CRLF. |
| `parseTxt` | `(text: string) => readonly string[][]` | `web/frontend/src/lib/upload/parsers.ts` | Tab/pipe/comma-delimited line splitter with header detection. |
| `parseXlsx` | `(buffer: ArrayBuffer) => Promise<readonly string[][]>` | `web/frontend/src/lib/upload/parsers.ts` | SheetJS dynamic import; reads the first sheet. |
| `parseFile` | `(file: File) => Promise<ParsedSourceFile>` | `web/frontend/src/lib/upload/parsers.ts` | Dispatch to the right parser; build `ParsedSourceFile` with columns, preview rows, row count. |
| `inferColumnType` | `(values: readonly string[]) => 'string' \| 'number' \| 'date' \| 'boolean'` | `web/frontend/src/lib/upload/infer.ts` | Majority-vote type inference over non-empty values. |
| `sampleValues` | `(values: readonly string[], max?: number) => readonly string[]` | `web/frontend/src/lib/upload/infer.ts` | First N non-empty unique values. |
| `createDraft` | `(input: { title: string; provider: string; client: string; periodLabel: string; recipient: ReportRecipient; source: DataSource; files: readonly ParsedSourceFile[] }) => ReportDraft` | `web/frontend/src/lib/upload/draft.ts` | Create a draft with a fresh `draftId` and timestamps. |
| `updateDraft` | `(draft: ReportDraft, patch: Partial<ReportDraft>) => ReportDraft` | `web/frontend/src/lib/upload/draft.ts` | Immutable update; bumps `updatedAt`. |
| `draftToManifest` | `(draft: ReportDraft) => ReportManifest` | `web/frontend/src/lib/upload/draft.ts` | Convert a completed draft into a validated manifest. Generates element ids from labels (slugified), builds evidence tables from mapped columns, sets `source`. |
| `validateDraft` | `(draft: ReportDraft) => readonly string[]` | `web/frontend/src/lib/upload/validation.ts` | Return human-readable errors: no files, no source, no mappings, unmapped columns, missing category/value columns for charts, empty claim templates. |
| `saveManifest` | `(manifest: ReportManifest) => Promise<void>` | `web/frontend/src/lib/evidence/store.ts` | Validate then write to `content/reports/${reportId}.json`. |

### Modified functions

| Function | File | Change |
| :--- | :--- | :--- |
| `parseElement` | `web/frontend/src/lib/evidence/manifest.ts` | Accept `'line-chart'` and `'table'` kinds; validate `lineSeries` and `tableColumns`. |
| `parseManifest` | `web/frontend/src/lib/evidence/manifest.ts` | Validate optional `source` object. |
| `loadManifest` | `web/frontend/src/lib/evidence/store.ts` | No signature change; `saveManifest` is additive. |

### Removed functions

None. The existing `addFile`/`handleDrop`/`handleFileInput` logic in `web/frontend/src/app/upload/page.tsx` is replaced by the `AuthoringWizard` components but the functions themselves are deleted as part of the page rewrite.

## [Classes]

No new classes are introduced; the codebase uses functional React components and plain TypeScript modules. The local Docker server is a single zero-dependency Node HTTP server module.

### New modules

| Module | File | Key exports |
| :--- | :--- | :--- |
| `LocalServer` | `docker/local/server.mjs` | `createServer(port, dataDir)` — handles `GET /health`, `GET /drafts`, `POST /drafts`, `GET /drafts/:id`, `PUT /drafts/:id`, `DELETE /drafts/:id`, `POST /publish`. Persists JSON files under `/data/drafts/` and `/data/manifests/`. |
| `AuthoringWizard` | `web/frontend/src/components/upload/AuthoringWizard.tsx` | React component with internal step state; renders `UploadDropzone`, `SourceForm`, `FieldMappingCanvas`, `ReportPreview`, and a publish button. |
| `FieldMappingCanvas` | `web/frontend/src/components/upload/FieldMappingCanvas.tsx` | React component with `onDragStart`/`onDrop` handlers; maintains `mappings` state. |

### Modified components

| Component | File | Change |
| :--- | :--- | :--- |
| `UploadPage` | `web/frontend/src/app/upload/page.tsx` | Replace simulated upload with `AuthoringWizard`. |
| `SampleReport` | `web/frontend/src/components/marketing/SampleReport.tsx` | Render `line-chart` and `table` elements. |
| `Navbar` | `web/frontend/src/components/Navbar.tsx` | Update "Upload PDF" label to "Create report". |

## [Dependencies]

Add one runtime dependency for XLSX parsing and no new dev dependencies; the local Docker container is zero-dependency.

| Package | Version | Where | Purpose |
| :--- | :--- | :--- | :--- |
| `xlsx` | `^0.18.5` | `web/frontend/package.json` | Parse `.xlsx` files client-side. Loaded via dynamic `import()` so it is code-split and only fetched when an XLSX file is dropped. |

No other dependency changes. The local Docker container uses only Node's built-in `http`, `fs`, `path`, and `crypto` modules.

## [Testing]

Add unit tests for the new upload/draft/validation modules and extend the existing manifest tests for the new element kinds; the existing 127-test suite must remain green.

### New test files

| File | Covers |
| :--- | :--- |
| `web/frontend/src/lib/upload/__tests__/parsers.test.ts` | CSV parsing (quoted fields, escaped quotes, CRLF, empty lines), TXT parsing (tab/pipe/comma delimiters), format detection (MIME + extension), column type inference, sample values. |
| `web/frontend/src/lib/upload/__tests__/draft.test.ts` | `createDraft` (ids, timestamps), `updateDraft` (immutability, `updatedAt` bump), `draftToManifest` (element id slugification, evidence table construction, source passthrough). |
| `web/frontend/src/lib/upload/__tests__/validation.test.ts` | Missing files, missing source, missing mappings, unmapped columns, chart mappings without category/value columns, empty claim templates. |

### Modified test files

| File | Change |
| :--- | :--- |
| `tools/evidence-pdf/test/manifest.test.ts` | Add cases for `line-chart` and `table` element kinds; add a case for a manifest with a `source` object; assert backward compatibility (existing manifests without `source` still parse). |

### Validation strategy

- `npm run verify` must pass: typecheck (web + tools) → 127+ existing tests + new tests → production build.
- `npm run lint` must pass.
- Manual smoke test: run the local Docker container, create a draft via the wizard, publish, and confirm the manifest appears in `content/reports/` and the evidence page renders.

## [Implementation Order]

Implement in dependency order: types → parsers → draft logic → local Docker container → UI components → page integration → docs → verification → PR/deploy.

1. **Extend the type system** — Add `UploadFormat`, `DataSource`, `SourceColumn`, `ParsedSourceFile`, `VisualizationKind`, `FieldMapping`, `ReportDraft` to `web/frontend/src/lib/evidence/types.ts`. Extend `ElementKind`, `ReportElement`, `ReportManifest`.
2. **Update manifest validation** — Modify `web/frontend/src/lib/evidence/manifest.ts` to accept `line-chart` and `table` kinds, validate `lineSeries`/`tableColumns`/`source`. Extend `tools/evidence-pdf/test/manifest.test.ts`.
3. **Add the upload library** — Create `web/frontend/src/lib/upload/format.ts`, `infer.ts`, `parsers.ts`, `draft.ts`, `validation.ts` with their tests.
4. **Add `saveManifest` to the store** — Modify `web/frontend/src/lib/evidence/store.ts`.
5. **Build the local Docker container** — Create `docker/local/Dockerfile`, `docker/local/server.mjs`, `docker/local/package.json`, `docker/local/README.md`, and root `docker-compose.yml`. Add `docker:build`/`docker:run`/`docker:stop` scripts to `package.json`.
6. **Add the API proxy routes** — Create `web/frontend/src/app/api/local/route.ts`, `drafts/route.ts`, `drafts/[id]/route.ts`, `publish/route.ts`.
7. **Build the authoring UI components** — Create `UploadDropzone.tsx`, `FilePreview.tsx`, `SourceForm.tsx`, `VisualizationPicker.tsx`, `FieldMappingCanvas.tsx`, `MappingCard.tsx`, `ReportPreview.tsx`, `AuthoringWizard.tsx`.
8. **Rewrite the upload page** — Replace `web/frontend/src/app/upload/page.tsx` with the `AuthoringWizard` integration.
9. **Update supporting components** — Modify `SampleReport.tsx` (line-chart/table rendering), `Navbar.tsx` (label), `web/frontend/src/app/e/[token]/page.tsx` (KIND_LABEL), `web/frontend/src/app/page.tsx` (copy).
10. **Copy the logo asset** — Convert `Minimalist_modern_logo_design_2K_202608052204.jpeg` to `web/frontend/public/ripodoc-logo.png` and integrate into Navbar, Footer, marketing hero, and upload page. ✅ Completed.
11. **Write documentation** — Create `docs/02-product/authoring-spec.md` and `docs/05-engineering/local-docker.md`. Update `README.md`, `docs/05-engineering/test-strategy.md`, `docs/05-engineering/deployment-runbook.md`.
12. **Run the full verification suite** — `npm run verify` (typecheck + tests + build) and `npm run lint`.
13. **Create the PR and deploy** — `git checkout -b feat/authoring-studio`, commit, push, `gh pr create`, and `vercel deploy --prod` (or `gh pr merge` + Vercel auto-deploy).