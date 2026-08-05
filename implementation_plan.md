# Implementation Plan

## [Overview]

Build the complete RipoDoc MVP — a secure reporting delivery and evidence layer for MSPs — from the current shipped foundation (PDF engine, token engine, audit log, evidence pages, upload lib, local Docker) to a production-deployed SaaS with the Go API, PostgreSQL RLS, WorkOS auth, Stripe billing, customer portal, and RBAC needed to close 10 paying founding partners within six months.

The codebase today (commit `9341043`) ships a battle-tested TypeScript PDF engine (127 tests), HMAC-SHA256 token engine, hash-chained audit log, token-gated evidence pages, a marketing site, and the upload library (format detection, parsers, draft management, validation — 758 lines) plus a local Docker container for persistence. What does NOT exist: the Go API backend (`cmd/api`), the worker service (`cmd/worker`), PostgreSQL with RLS, WorkOS authentication, Stripe billing, the authoring wizard UI (`components/upload/` is empty), the customer portal (`app/dashboard/` is empty), the security page (`app/security/` is empty), RBAC, watermarking, and AWS infrastructure. The upload page (`app/upload/page.tsx`) still uses simulated `setInterval` progress and accepts only PDFs.

This implementation plan covers the full 6-month build in three phases aligned with `docs/00-strategy/master-plan.md` §9: Phase 1 (Month 1) ships the Go API skeleton, auth, database, tenant middleware, report CRUD, share-link API, and closes 3 prepaid founding partners; Phase 2 (Months 2–3) onboards partners, builds the authoring wizard UI, review queue, customer portal, RBAC, watermarking, and export controls; Phase 3 (Months 4–6) hardens security (pen test, SOC 2 Type 1 readiness), ships CSV/REST adapters, embedded report beta, and reaches 10 paying customers at $7.5k+ MRR. The plan preserves the existing trust boundary (PDF engine, token engine, audit chain) and extends it to the Go backend and PostgreSQL without rewriting any shipped code. The existing `docs/ripodoc-product-analysis.md` contains the complete strategy deliverables (Market Feasibility, Technical Feasibility, Roadmap, Bug Fixes, PRD); this document is the engineering implementation plan that executes that strategy.

## [Types]

Extend the existing TypeScript type system for the Go backend's database schema, API contracts, and the authoring wizard UI, while keeping all existing types in `web/frontend/src/lib/evidence/types.ts` backward-compatible.

### Go domain types (new — `cmd/api/internal/domain/`)

```go
// Tenant represents an MSP organization.
type Tenant struct {
    ID        string    `json:"id"`          // ULID
    Name      string    `json:"name"`        // MSP legal name
    Slug      string    `json:"slug"`        // URL-safe identifier
    Plan      string    `json:"plan"`        // "founding" | "core" | "scale"
    CreatedAt time.Time `json:"createdAt"`
}

// User is an MSP staff member with a role.
type User struct {
    ID        string    `json:"id"`          // ULID
    TenantID  string    `json:"tenantId"`    // RLS scope
    Email     string    `json:"email"`       // WorkOS-authenticated
    Name      string    `json:"name"`
    Role      string    `json:"role"`        // "owner" | "admin" | "author" | "reviewer"
    Status    string    `json:"status"`      // "active" | "invited" | "disabled"
    CreatedAt time.Time `json:"createdAt"`
}

// Customer is an MSP's client organization.
type Customer struct {
    ID           string    `json:"id"`           // ULID
    TenantID     string    `json:"tenantId"`     // Owning MSP
    Name         string    `json:"name"`
    ContactEmail string    `json:"contactEmail"`
    CreatedAt    time.Time `json:"createdAt"`
}

// Report is a published or draft report version.
type Report struct {
    ID          string          `json:"id"`
    TenantID    string          `json:"tenantId"`
    CustomerID  string          `json:"customerId"`
    Title       string          `json:"title"`
    PeriodLabel string          `json:"periodLabel"`
    Provider    string          `json:"provider"`
    Client      string          `json:"client"`
    Version     int             `json:"version"`     // Immutable once published
    Status      string          `json:"status"`      // "draft" | "published" | "archived"
    Manifest    json.RawMessage `json:"manifest,omitempty"` // Frozen at publish
    PublishedAt *time.Time      `json:"publishedAt,omitempty"`
    PublishedBy *string         `json:"publishedBy,omitempty"`
    CreatedAt   time.Time       `json:"createdAt"`
    UpdatedAt   time.Time       `json:"updatedAt"`
}

// ReportElement is an extracted/approved element in the review queue.
type ReportElement struct {
    ID         string          `json:"id"`
    ReportID   string          `json:"reportId"`
    Kind       string          `json:"kind"`         // "kpi" | "bar-chart" | "line-chart" | "table" | "claim"
    Label      string          `json:"label"`
    Value      *string         `json:"value,omitempty"`
    Confidence float64         `json:"confidence"`   // 0.0–1.0
    Status     string          `json:"status"`       // "pending" | "approved" | "rejected" | "visual-only"
    ApprovedBy *string         `json:"approvedBy,omitempty"`
    ApprovedAt *time.Time      `json:"approvedAt,omitempty"`
    SourceRows json.RawMessage `json:"sourceRows,omitempty"` // Evidence table JSON
    Page       *int            `json:"page,omitempty"`
    Rect       *Rect           `json:"rect,omitempty"`
}

// ShareLink is a recipient-bound, expiring, revocable link.
type ShareLink struct {
    ID            string     `json:"id"`             // ULID (jti)
    ReportID      string     `json:"reportId"`
    Version       int        `json:"version"`
    RecipientName string     `json:"recipientName"`
    RecipientHash string     `json:"recipientHash"`  // SHA-256 of email
    Token         string     `json:"token"`          // HMAC-SHA256 signed
    TTLDays       int        `json:"ttlDays"`
    ExpiresAt     time.Time  `json:"expiresAt"`
    RevokedAt     *time.Time `json:"revokedAt,omitempty"`
    DownloadOK    bool       `json:"downloadOk"`
    ExportOK      bool       `json:"exportOk"`
    Watermark     bool       `json:"watermark"`
    CreatedAt     time.Time  `json:"createdAt"`
}

// AuditEvent is an append-only, hash-chained record.
type AuditEvent struct {
    ID        string          `json:"id"`            // ULID
    TenantID  string          `json:"tenantId"`
    EventType string          `json:"eventType"`     // "report.published" | "evidence.accessed" | ...
    ActorID   *string         `json:"actorId,omitempty"`
    SubjectID *string         `json:"subjectId,omitempty"`
    Payload   json.RawMessage `json:"payload,omitempty"`
    PrevHash  string          `json:"prevHash"`      // SHA-256 of previous record
    Hash      string          `json:"hash"`          // SHA-256(prevHash ‖ canonical(this))
    CreatedAt time.Time       `json:"createdAt"`
}
```

### TypeScript API client types (new — `web/frontend/src/lib/api/types.ts`)

```ts
export interface Tenant { readonly id: string; readonly name: string; readonly slug: string; readonly plan: string; }
export interface User { readonly id: string; readonly tenantId: string; readonly email: string; readonly name: string; readonly role: 'owner' | 'admin' | 'author' | 'reviewer'; readonly status: string; }
export interface Customer { readonly id: string; readonly name: string; readonly contactEmail: string; }
export interface ReportSummary { readonly id: string; readonly customerId: string; readonly title: string; readonly periodLabel: string; readonly status: 'draft' | 'published' | 'archived'; readonly version: number; readonly publishedAt?: string; }
export interface ShareLinkSummary { readonly id: string; readonly reportId: string; readonly recipientName: string; readonly expiresAt: string; readonly revokedAt?: string; readonly exportOk: boolean; }
export interface AuditEventSummary { readonly id: string; readonly eventType: string; readonly createdAt: string; readonly actorId?: string; readonly subjectId?: string; }
```

### Existing types (no changes needed)

All types in `web/frontend/src/lib/evidence/types.ts` (ReportManifest, ReportElement, EvidenceDetail, DataSource, UploadFormat, ParsedSourceFile, FieldMapping, ReportDraft, etc.) are already extended and shipped. No modifications required.

## [Files]

Create the Go backend, database migrations, authoring wizard UI, customer portal, and supporting infrastructure; modify the upload page and supporting components.

### New files — Go backend (`cmd/`)

| Path | Purpose |
| :--- | :--- |
| `cmd/api/main.go` | Entry point for the API server. Loads config, connects to PostgreSQL, mounts chi routes, starts HTTP server on port 8080. |
| `cmd/api/internal/config/config.go` | Environment-based config: `DATABASE_URL`, `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `STRIPE_SECRET_KEY`, `EVIDENCE_SECRET` (≥32 chars), `S3_BUCKET`, `KMS_KEY_ID`, `PORT`. |
| `cmd/api/internal/db/db.go` | pgx connection pool with RLS-aware context. Sets `app.current_tenant` session variable on each request. |
| `cmd/api/internal/db/queries/` | sqlc-generated query files (from `.sql` files in `cmd/api/internal/db/sql/`). |
| `cmd/api/internal/domain/tenant.go` | Tenant domain model + repository. |
| `cmd/api/internal/domain/user.go` | User domain model + repository. |
| `cmd/api/internal/domain/customer.go` | Customer domain model + repository. |
| `cmd/api/internal/domain/report.go` | Report + ReportElement domain models + repositories. |
| `cmd/api/internal/domain/sharelink.go` | ShareLink domain model + repository. Token minting mirrors `web/frontend/src/lib/evidence/token.ts` (HMAC-SHA256, expiry, jti, version pinning). |
| `cmd/api/internal/domain/audit.go` | AuditEvent domain model + append-only repository with hash chaining. |
| `cmd/api/internal/auth/middleware.go` | WorkOS session validation middleware. Extracts user + tenant from session, sets RLS context. |
| `cmd/api/internal/auth/workos.go` | WorkOS AuthKit integration: session exchange, user lookup, SSO redirect. |
| `cmd/api/internal/api/router.go` | chi router mounting all route groups. |
| `cmd/api/internal/api/reports.go` | Report CRUD handlers: `POST /reports`, `GET /reports`, `GET /reports/:id`, `POST /reports/:id/publish`. |
| `cmd/api/internal/api/elements.go` | Review queue handlers: `GET /reports/:id/elements`, `PATCH /reports/:id/elements/:elementId`. |
| `cmd/api/internal/api/sources.go` | Source upload handlers: `POST /reports/:id/sources` (PDF/CSV upload to S3). |
| `cmd/api/internal/api/share.go` | Share link handlers: `POST /reports/:id/versions/:version/share-links`, `DELETE /share-links/:jti`. |
| `cmd/api/internal/api/customers.go` | Customer CRUD handlers. |
| `cmd/api/internal/api/audit.go` | Audit log viewer handlers: `GET /audit-events`. |
| `cmd/api/internal/api/billing.go` | Stripe webhook handler: `POST /webhooks/stripe` (subscription created, invoice paid, subscription cancelled). |
| `cmd/api/internal/api/health.go` | `GET /health` — database + S3 connectivity check. |
| `cmd/worker/main.go` | Entry point for the background worker. Connects to PostgreSQL, starts River queue consumers. |
| `cmd/worker/internal/jobs/extract.go` | Extraction job: reads uploaded PDF/CSV from S3, runs text extraction or CSV parsing, writes candidate elements to the database. |
| `cmd/worker/internal/jobs/pdfgen.go` | PDF generation job: calls the TypeScript PDF engine via subprocess or ports the renderer to Go. |
| `cmd/worker/internal/jobs/qa.go` | QA job: deterministic checks (totals reconcile, no contradictions, every approved element has source). |

### New files — Database migrations (`migrations/`)

| Path | Purpose |
| :--- | :--- |
| `migrations/001_create_extensions.sql` | `CREATE EXTENSION IF NOT EXISTS "pgcrypto";` for ULID generation. |
| `migrations/002_create_tenants_users.sql` | `tenants` and `users` tables with RLS policies. |
| `migrations/003_create_customers_reports.sql` | `customers`, `reports`, `report_elements` tables with RLS. |
| `migrations/004_create_share_links.sql` | `share_links` table with RLS. Token column stores the HMAC-signed string. |
| `migrations/005_create_audit_events.sql` | `audit_events` table (append-only, hash-chained). RLS on `tenant_id`. |
| `migrations/006_create_river_jobs.sql` | River job queue schema (`river_job` table). |
| `migrations/007_create_rls_policies.sql` | RLS policies for all tables: `USING (tenant_id = current_setting('app.current_tenant', true))`. |
| `migrations/008_create_indexes.sql` | Indexes on `reports(tenant_id, customer_id)`, `share_links(report_id)`, `audit_events(tenant_id, created_at)`. |

### New files — Authoring wizard UI (`web/frontend/src/components/upload/`)

| Path | Purpose |
| :--- | :--- |
| `web/frontend/src/components/upload/AuthoringWizard.tsx` | Multi-step wizard: Upload → Declare source → Map fields → Preview → Publish. Uses framer-motion for step transitions. |
| `web/frontend/src/components/upload/UploadDropzone.tsx` | Multi-format drag-and-drop zone using `react-dropzone`. Accepts PDF, CSV, XLSX, TXT, DOC, DOCX, images. |
| `web/frontend/src/components/upload/FilePreview.tsx` | Inline preview: CSV/XLSX/TXT as a 10-row table; PDF/DOC/images as a thumbnail card. Uses `react-pdf` for PDF preview. |
| `web/frontend/src/components/upload/SourceForm.tsx` | Form for declaring the data source: system name, description, method, captured-at date. |
| `web/frontend/src/components/upload/VisualizationPicker.tsx` | Card grid of visualisation options (KPI, bar chart, line chart, table, claim) with Lucide icons. |
| `web/frontend/src/components/upload/FieldMappingCanvas.tsx` | Drag-and-drop canvas: source columns on the left, visualisation targets on the right. Native HTML5 drag-and-drop. |
| `web/frontend/src/components/upload/MappingCard.tsx` | A single mapping row: column selector, visualisation selector, label input, per-kind options. |
| `web/frontend/src/components/upload/ReportPreview.tsx` | Live preview using `recharts` for bar/line charts and the existing EvidenceGrid for tables. |
| `web/frontend/src/components/upload/PublishDialog.tsx` | Confirmation dialog before publishing: shows summary, validates draft, calls publish API. |

### New files — Customer portal (`web/frontend/src/app/dashboard/`)

| Path | Purpose |
| :--- | :--- |
| `web/frontend/src/app/dashboard/page.tsx` | Portal home: report list with filters (customer, date, status), key metrics (views, exports, denials). |
| `web/frontend/src/app/dashboard/reports/page.tsx` | All reports view with search, filter, and pagination. |
| `web/frontend/src/app/dashboard/reports/[id]/page.tsx` | Single report detail: versions, share links, audit events, element list. |
| `web/frontend/src/app/dashboard/audit/page.tsx` | Audit log viewer: filterable, paginated table of all audit events. |
| `web/frontend/src/app/dashboard/customers/page.tsx` | Customer list and management. |
| `web/frontend/src/app/dashboard/settings/page.tsx` | Tenant settings: branding, security, billing. |

### New files — Security page, auth, and API client

| Path | Purpose |
| :--- | :--- |
| `web/frontend/src/app/security/page.tsx` | Public security page explaining the trust model, audit chain, and compliance posture. |
| `web/frontend/src/app/auth/login/page.tsx` | WorkOS login redirect page. |
| `web/frontend/src/app/auth/callback/page.tsx` | WorkOS OAuth callback handler. |
| `web/frontend/src/lib/api/client.ts` | Typed API client for the Go backend. Wraps `fetch` with auth session injection. |
| `web/frontend/src/lib/api/reports.ts` | Report API functions: `createReport`, `getReport`, `publishReport`, `listReports`. |
| `web/frontend/src/lib/api/share.ts` | Share link API functions: `createShareLink`, `revokeShareLink`, `listShareLinks`. |
| `web/frontend/src/lib/api/audit.ts` | Audit API functions: `listAuditEvents`. |
| `web/frontend/src/lib/auth/session.ts` | Client-side session helper: `getSession()`, `requireAuth()`, role checks. |

### New files — Infrastructure and CI/CD

| Path | Purpose |
| :--- | :--- |
| `go.mod` | Go module definition (`module github.com/thecelestialmismatch/RipoDoc`, `go 1.24`). |
| `go.sum` | Go dependency checksums. |
| `sqlc.yaml` | sqlc configuration: generates Go from SQL queries in `cmd/api/internal/db/sql/`. |
| `.github/workflows/ci.yml` | GitHub Actions: Go test, Go build, npm verify, Trivy scan, CodeQL, Gitleaks. |
| `.github/workflows/deploy.yml` | Deploy workflow: build Docker images, push to ECR, deploy to ECS Fargate. |
| `infra/main.tf` | OpenTofu: RDS PostgreSQL, ElastiCache Redis, S3 bucket, KMS key, ECS cluster, Fargate task definitions, WAF, CloudFront. |
| `infra/variables.tf` | OpenTofu variables: region, instance sizes, secrets references. |
| `Dockerfile.api` | Multi-stage Go build for the API service. |
| `Dockerfile.worker` | Multi-stage Go build for the worker service. |
| `docker-compose.prod.yml` | Local production-like stack: PostgreSQL, Redis, API, worker. |

### New files — Tests

| Path | Purpose |
| :--- | :--- |
| `cmd/api/internal/api/reports_test.go` | Report CRUD integration tests with a test PostgreSQL instance. |
| `cmd/api/internal/api/share_test.go` | Share link minting, revocation, and token verification tests. |
| `cmd/api/internal/api/audit_test.go` | Audit chain integrity tests (hash chaining, tamper detection). |
| `cmd/api/internal/auth/middleware_test.go` | Auth middleware: session validation, RLS context, unauthenticated rejection. |
| `cmd/api/internal/domain/rls_test.go` | Cross-tenant isolation test: Tenant A cannot read Tenant B data. |
| `web/frontend/src/lib/api/__tests__/client.test.ts` | API client: auth header injection, error handling, JSON parsing. |
| `web/frontend/src/components/upload/__tests__/AuthoringWizard.test.tsx` | Wizard step navigation, draft validation, publish flow. |

### Modified files

| Path | Change |
| :--- | :--- |
| `web/frontend/src/app/upload/page.tsx` | Replace the simulated PDF-only upload with the `AuthoringWizard` component. Remove `setInterval`/`setTimeout` simulation. |
| `web/frontend/src/components/Navbar.tsx` | Change "Upload PDF" label to "Create report". Add auth-aware links (Dashboard, Settings) when logged in. |
| `web/frontend/src/app/page.tsx` | Update marketing copy from "Upload your PDF" to "Upload your data". Add link to security page. |
| `web/frontend/src/app/e/[token]/page.tsx` | Add `'line-chart'` and `'table'` to `KIND_LABEL` map. Add watermark rendering when `watermark` flag is set on the token. |
| `web/frontend/src/app/e/[token]/[elementId]/page.tsx` | Add watermark overlay (recipient name + timestamp) when authorized. |
| `web/frontend/src/components/marketing/SampleReport.tsx` | Render `line-chart` and `table` elements. Document `canExport={true}` as intentional for the marketing demo. |
| `web/frontend/src/lib/evidence/config.ts` | Add `watermarkEnabled()` config check. |
| `web/frontend/next.config.ts` | Add API rewrites: `/api/*` → `https://api.ripodoc.com/v1/*` in production; `localhost:8080` in development. |
| `package.json` | Add `go:build`, `go:test`, `migrate:up`, `migrate:down`, `infra:apply`, `infra:plan` scripts. |
| `docs/05-engineering/architecture.md` | Update "planned" status to "shipped" for components as they are built. |
| `docs/05-engineering/test-strategy.md` | Add Go backend tests, RLS isolation tests, and Stripe webhook tests to the test matrix. |
| `docs/05-engineering/deployment-runbook.md` | Document ECS Fargate deployment, database migration procedure, and rollback steps. |
| `docs/02-product/prd.md` | Replace the 31-line stub with the full PRD from `docs/ripodoc-product-analysis.md` §5. |
| `README.md` | Document the full stack, local development setup, and deployment instructions. |

### Files to delete

| Path | Reason |
| :--- | :--- |
| `web/frontend/src/components/ReportViewer.tsx` (in worktree only) | Dead code in the worktree branch — hardcoded mock data, never imported. Not present in the main branch. |

## [Functions]

Add Go backend handlers, database queries, and auth functions; build the authoring wizard React components; modify the upload page and evidence pages.

### New functions — Go API

| Function | Signature | File | Purpose |
| :--- | :--- | :--- | :--- |
| `main` | `func main()` | `cmd/api/main.go` | Load config, init DB pool, mount router, start server. |
| `LoadConfig` | `func LoadConfig() (*Config, error)` | `cmd/api/internal/config/config.go` | Read env vars, validate `EVIDENCE_SECRET` ≥32 chars. |
| `NewPool` | `func NewPool(ctx context.Context, dbURL string) (*pgxpool.Pool, error)` | `cmd/api/internal/db/db.go` | Create pgx connection pool with sane defaults. |
| `SetTenantContext` | `func SetTenantContext(ctx context.Context, tx pgx.Tx, tenantID string) error` | `cmd/api/internal/db/db.go` | Execute `SET LOCAL app.current_tenant = $1` on the transaction. |
| `AuthMiddleware` | `func AuthMiddleware(workos *WorkOSClient) func(http.Handler) http.Handler` | `cmd/api/internal/auth/middleware.go` | Validate WorkOS session, load user+tenant, set RLS context. |
| `RequireRole` | `func RequireRole(roles ...string) func(http.Handler) http.Handler` | `cmd/api/internal/auth/middleware.go` | RBAC gate: only allow specified roles. |
| `CreateReport` | `func (h *ReportsHandler) CreateReport(w http.ResponseWriter, r *http.Request)` | `cmd/api/internal/api/reports.go` | `POST /reports` — create a draft. |
| `ListReports` | `func (h *ReportsHandler) ListReports(w http.ResponseWriter, r *http.Request)` | `cmd/api/internal/api/reports.go` | `GET /reports` — list tenant's reports. |
| `GetReport` | `func (h *ReportsHandler) GetReport(w http.ResponseWriter, r *http.Request)` | `cmd/api/internal/api/reports.go` | `GET /reports/:id` — single report with elements. |
| `PublishReport` | `func (h *ReportsHandler) PublishReport(w http.ResponseWriter, r *http.Request)` | `cmd/api/internal/api/reports.go` | `POST /reports/:id/publish` — freeze immutable version, generate PDF, audit event. |
| `ListElements` | `func (h *ElementsHandler) ListElements(w http.ResponseWriter, r *http.Request)` | `cmd/api/internal/api/elements.go` | `GET /reports/:id/elements` — review queue. |
| `UpdateElement` | `func (h *ElementsHandler) UpdateElement(w http.ResponseWriter, r *http.Request)` | `cmd/api/internal/api/elements.go` | `PATCH /reports/:id/elements/:elementId` — approve/reject/correct. |
| `UploadSource` | `func (h *SourcesHandler) UploadSource(w http.ResponseWriter, r *http.Request)` | `cmd/api/internal/api/sources.go` | `POST /reports/:id/sources` — upload to S3, enqueue extraction job. |
| `CreateShareLink` | `func (h *ShareHandler) CreateShareLink(w http.ResponseWriter, r *http.Request)` | `cmd/api/internal/api/share.go` | `POST /reports/:id/versions/:version/share-links` — mint HMAC token. |
| `RevokeShareLink` | `func (h *ShareHandler) RevokeShareLink(w http.ResponseWriter, r *http.Request)` | `cmd/api/internal/api/share.go` | `DELETE /share-links/:jti` — set `revoked_at`. |
| `ListAuditEvents` | `func (h *AuditHandler) ListAuditEvents(w http.ResponseWriter, r *http.Request)` | `cmd/api/internal/api/audit.go` | `GET /audit-events` — paginated audit log. |
| `StripeWebhook` | `func (h *BillingHandler) StripeWebhook(w http.ResponseWriter, r *http.Request)` | `cmd/api/internal/api/billing.go` | `POST /webhooks/stripe` — verify signature, process events. |
| `MintToken` | `func MintToken(secret string, reportID string, version int, recipientHash string, ttlDays int, jti string) (string, error)` | `cmd/api/internal/domain/sharelink.go` | HMAC-SHA256 token minting — mirrors `web/frontend/src/lib/evidence/token.ts`. |
| `VerifyToken` | `func VerifyToken(secret string, token string) (*TokenClaims, error)` | `cmd/api/internal/domain/sharelink.go` | Constant-time token verification with fail-closed semantics. |
| `AppendAuditEvent` | `func (r *AuditRepository) AppendAuditEvent(ctx context.Context, event AuditEvent) error` | `cmd/api/internal/domain/audit.go` | Append-only insert with hash chaining: `hash = SHA-256(prevHash ‖ canonical(event))`. |

### New functions — Worker

| Function | Signature | File | Purpose |
| :--- | :--- | :--- | :--- |
| `main` | `func main()` | `cmd/worker/main.go` | Connect to PostgreSQL, start River consumers. |
| `Extract` | `func (w *ExtractWorker) Work(ctx context.Context, job *river.Job[ExtractArgs]) error` | `cmd/worker/internal/jobs/extract.go` | Read file from S3, extract elements, write to DB. |
| `GeneratePDF` | `func (w *PDFGenWorker) Work(ctx context.Context, job *river.Job[PDFGenArgs]) error` | `cmd/worker/internal/jobs/pdfgen.go` | Generate clickable PDF from manifest. |
| `RunQA` | `func (w *QAWorker) Work(ctx context.Context, job *river.Job[QAArgs]) error` | `cmd/worker/internal/jobs/qa.go` | Deterministic QA checks pre-publish. |

### New functions — Frontend API client

| Function | Signature | File | Purpose |
| :--- | :--- | :--- | :--- |
| `apiFetch` | `async function apiFetch(path: string, init?: RequestInit): Promise<Response>` | `web/frontend/src/lib/api/client.ts` | Wraps `fetch` with auth session, JSON headers, error handling. |
| `createReport` | `async function createReport(input: CreateReportInput): Promise<ReportSummary>` | `web/frontend/src/lib/api/reports.ts` | `POST /reports`. |
| `publishReport` | `async function publishReport(id: string): Promise<PublishResult>` | `web/frontend/src/lib/api/reports.ts` | `POST /reports/:id/publish`. |
| `createShareLink` | `async function createShareLink(reportId: string, version: number, input: CreateShareLinkInput): Promise<ShareLinkSummary>` | `web/frontend/src/lib/api/share.ts` | `POST /reports/:id/versions/:version/share-links`. |
| `revokeShareLink` | `async function revokeShareLink(jti: string): Promise<void>` | `web/frontend/src/lib/api/share.ts` | `DELETE /share-links/:jti`. |
| `listAuditEvents` | `async function listAuditEvents(params?: AuditQueryParams): Promise<AuditEventSummary[]>` | `web/frontend/src/lib/api/audit.ts` | `GET /audit-events`. |

### New functions — Authoring wizard

| Function | Signature | File | Purpose |
| :--- | :--- | :--- | :--- |
| `AuthoringWizard` | `function AuthoringWizard(): JSX.Element` | `web/frontend/src/components/upload/AuthoringWizard.tsx` | Multi-step wizard with state machine: `upload → source → map → preview → publish`. |
| `UploadDropzone` | `function UploadDropzone(props: { onFiles: (files: ParsedSourceFile[]) => void }): JSX.Element` | `web/frontend/src/components/upload/UploadDropzone.tsx` | Drag-and-drop zone using `react-dropzone`, calls `parseFile` from `lib/upload/parsers.ts`. |
| `FieldMappingCanvas` | `function FieldMappingCanvas(props: { columns: SourceColumn[]; mappings: FieldMapping[]; onChange: (m: FieldMapping[]) => void }): JSX.Element` | `web/frontend/src/components/upload/FieldMappingCanvas.tsx` | Drag-and-drop mapping UI. |
| `ReportPreview` | `function ReportPreview(props: { draft: ReportDraft }): JSX.Element` | `web/frontend/src/components/upload/ReportPreview.tsx` | Live preview using `draftToManifest(draft)` and `recharts`. |
| `PublishDialog` | `function PublishDialog(props: { draft: ReportDraft; onPublish: () => Promise<void> }): JSX.Element` | `web/frontend/src/components/upload/PublishDialog.tsx` | Confirmation dialog, validates via `validateDraft`, calls `publishReport`. |

### Modified functions

| Function | File | Change |
| :--- | :--- | :--- |
| `UploadPage` | `web/frontend/src/app/upload/page.tsx` | Replace simulated upload with `<AuthoringWizard />`. Remove `addFile`, `handleDrop`, `handleFileInput`, `setInterval`/`setTimeout` simulation. |
| `KIND_LABEL` | `web/frontend/src/app/e/[token]/page.tsx` | Add `'line-chart': 'Line chart'` and `'table': 'Table'` entries. |
| `SampleReport` | `web/frontend/src/components/marketing/SampleReport.tsx` | Add rendering branches for `line-chart` (recharts LineChart) and `table` (EvidenceGrid). |

### Removed functions

| Function | File | Reason | Migration |
| :--- | :--- | :--- | :--- |
| `addFile` | `web/frontend/src/app/upload/page.tsx` | Simulated upload with `setInterval` fake progress. | Replaced by `UploadDropzone` → `parseFile` → real draft management. |
| `handleDrop` | `web/frontend/src/app/upload/page.tsx` | PDF-only filter, no real processing. | Replaced by `react-dropzone` in `UploadDropzone`. |
| `handleFileInput` | `web/frontend/src/app/upload/page.tsx` | Same as above. | Replaced by `react-dropzone`. |

## [Classes]

No new classes in the TypeScript codebase (functional React components and plain modules). The Go backend introduces struct-based domain models and handler structs.

### New Go structs

| Struct | File | Key Methods | Purpose |
| :--- | :--- | :--- | :--- |
| `Config` | `cmd/api/internal/config/config.go` | `LoadConfig()`, `Validate()` | Environment configuration. |
| `ReportsHandler` | `cmd/api/internal/api/reports.go` | `CreateReport`, `ListReports`, `GetReport`, `PublishReport` | HTTP handlers for report CRUD. |
| `ElementsHandler` | `cmd/api/internal/api/elements.go` | `ListElements`, `UpdateElement` | HTTP handlers for the review queue. |
| `ShareHandler` | `cmd/api/internal/api/share.go` | `CreateShareLink`, `RevokeShareLink` | HTTP handlers for share links. |
| `AuditHandler` | `cmd/api/internal/api/audit.go` | `ListAuditEvents` | HTTP handler for audit log viewer. |
| `BillingHandler` | `cmd/api/internal/api/billing.go` | `StripeWebhook` | Stripe webhook processor. |
| `WorkOSClient` | `cmd/api/internal/auth/workos.go` | `ExchangeCode`, `GetUser`, `GetTenant` | WorkOS AuthKit integration. |
| `AuditRepository` | `cmd/api/internal/domain/audit.go` | `AppendAuditEvent`, `ListEvents`, `VerifyChain` | Append-only hash-chained audit store. |
| `ExtractWorker` | `cmd/worker/internal/jobs/extract.go` | `Work` | River job worker for extraction. |
| `PDFGenWorker` | `cmd/worker/internal/jobs/pdfgen.go` | `Work` | River job worker for PDF generation. |
| `QAWorker` | `cmd/worker/internal/jobs/qa.go` | `Work` | River job worker for QA checks. |

### Modified components

| Component | File | Change |
| :--- | :--- | :--- |
| `UploadPage` | `web/frontend/src/app/upload/page.tsx` | Replace simulated upload with `AuthoringWizard`. |
| `Navbar` | `web/frontend/src/components/Navbar.tsx` | Auth-aware links, "Create report" label. |
| `SampleReport` | `web/frontend/src/components/marketing/SampleReport.tsx` | Render `line-chart` and `table` elements. |

## [Dependencies]

Add Go dependencies for the backend; the frontend dependencies are already installed (xlsx, recharts, react-dropzone, react-pdf, framer-motion, radix-ui, lucide-react, tailwind-merge).

### Go dependencies (`go.mod`)

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `github.com/go-chi/chi/v5` | `v5.2.1` | HTTP router. |
| `github.com/jackc/pgx/v5` | `v5.7.4` | PostgreSQL driver. |
| `github.com/jackc/pgx/v5/pgxpool` | `v5.7.4` | Connection pooling. |
| `github.com/sqlc-dev/sqlc` | `latest` | Type-safe SQL code generation. |
| `github.com/riverqueue/river` | `v0.16.2` | PostgreSQL-backed job queue. |
| `github.com/redis/go-redis/v9` | `v9.x` | Redis client for River backend. |
| `github.com/stripe/stripe-go/v82` | `v82` | Stripe billing SDK. |
| `github.com/workos/workos-go` | `latest` | WorkOS AuthKit SDK. |
| `github.com/aws/aws-sdk-go-v2` | `latest` | AWS SDK (S3, KMS, Textract). |
| `github.com/oklog/ulid/v2` | `v2.1.0` | ULID generation for IDs. |
| `github.com/prometheus/client_golang` | `latest` | Metrics (optional, for observability). |
| `go.opentelemetry.io/otel` | `latest` | Distributed tracing. |

### Frontend dependencies (already installed — no changes)

All required frontend dependencies are already in `web/frontend/package.json`: `next@16.2.12`, `react@19.2.4`, `xlsx@^0.18.5`, `recharts@^3.10.1`, `react-dropzone@^20.0.0`, `react-pdf@^10.4.1`, `framer-motion@^12.43.0`, `@radix-ui/*`, `lucide-react@^1.27.0`, `tailwind-merge@^3.6.0`.

### Infrastructure dependencies

| Tool | Purpose |
| :--- | :--- |
| `golang-migrate` | Database migration runner. |
| `sqlc` | SQL-to-Go code generation. |
| `golangci-lint` | Go static analysis. |
| `OpenTofu` | Infrastructure as code. |
| `Trivy` | Container vulnerability scanning. |
| `CodeQL` | Static code analysis. |
| `Gitleaks` | Secret scanning. |

## [Testing]

Extend the existing 127-test suite with Go backend tests, RLS isolation tests, and frontend component tests; the existing trust-boundary tests must remain green at all times.

### New test files

| File | Covers |
| :--- | :--- |
| `cmd/api/internal/api/reports_test.go` | Report CRUD: create, list, get, publish. Version immutability after publish. Tenant scoping (Tenant A cannot see Tenant B's reports). |
| `cmd/api/internal/api/share_test.go` | Share link minting (HMAC-SHA256), revocation, token verification (fail-closed on bad signature, expiry, revocation, wrong report, version mismatch). |
| `cmd/api/internal/api/audit_test.go` | Audit chain integrity: append, verify hash chain, detect edit/delete/reorder. |
| `cmd/api/internal/auth/middleware_test.go` | Auth middleware: valid session passes, invalid session rejected, RLS context set correctly. |
| `cmd/api/internal/domain/rls_test.go` | Cross-tenant isolation: Tenant A user cannot read Tenant B data even with raw SQL. |
| `cmd/api/internal/api/billing_test.go` | Stripe webhook: signature verification, idempotency, subscription lifecycle events. |
| `web/frontend/src/lib/api/__tests__/client.test.ts` | API client: auth header injection, error handling, JSON parsing. |
| `web/frontend/src/components/upload/__tests__/AuthoringWizard.test.tsx` | Wizard step navigation, file upload, field mapping, draft validation, publish flow. |

### Modified test files

| File | Change |
| :--- | :--- |
| `tools/evidence-pdf/test/manifest.test.ts` | Add cases for `line-chart` and `table` element kinds; add a case for a manifest with a `source` object; assert backward compatibility. |
| `docs/05-engineering/test-strategy.md` | Add Go backend tests, RLS isolation tests, Stripe webhook tests, and WorkOS auth flow tests to the test matrix. |

### Validation strategy

- `npm run verify` must pass: typecheck (web + tools) → 127+ existing tests + new tests → production build.
- `npm run lint` must pass.
- `go test ./...` must pass all Go tests.
- `golangci-lint run` must pass.
- RLS isolation test must prove Tenant A cannot read Tenant B data.
- Stripe webhook test must verify signature and idempotency.
- Manual smoke test: create a report via the wizard, publish, share, click a figure in the PDF, verify evidence page renders with correct rows and audit log entry.
- Pen test (independent, Month 5) must pass with no critical findings.

## [Implementation Order]

Implement in dependency order: database → Go API skeleton → auth → report CRUD → authoring wizard UI → review queue → publish → share links → customer portal → RBAC → watermarking → security hardening → billing → infrastructure → launch.

1. **Set up the Go project and database (Week 1)** — Create `go.mod`, `cmd/api/main.go`, `cmd/api/internal/config/`, `cmd/api/internal/db/`. Write migrations 001–008. Run `golang-migrate up` against a local PostgreSQL. Generate sqlc code. Write the RLS isolation test and prove it passes.
2. **Implement WorkOS auth middleware (Week 1)** — Create `cmd/api/internal/auth/middleware.go` and `workos.go`. Implement session validation, user/tenant loading, RLS context setting. Write auth middleware tests. Create the frontend login/callback pages.
3. **Build report CRUD API (Week 1–2)** — Create `cmd/api/internal/api/reports.go`, `elements.go`, `sources.go`. Implement `POST /reports`, `GET /reports`, `GET /reports/:id`, `POST /reports/:id/sources`, `GET /reports/:id/elements`, `PATCH /reports/:id/elements/:elementId`. Write API tests. Create the frontend API client (`lib/api/`).
4. **Build the authoring wizard UI (Week 2)** — Create `AuthoringWizard.tsx`, `UploadDropzone.tsx`, `FilePreview.tsx`, `SourceForm.tsx`, `VisualizationPicker.tsx`, `FieldMappingCanvas.tsx`, `MappingCard.tsx`, `ReportPreview.tsx`, `PublishDialog.tsx`. Replace `app/upload/page.tsx` with the wizard. Update `Navbar.tsx` label.
5. **Implement publish and share links (Week 2)** — Create `POST /reports/:id/publish` (freeze version, generate PDF, audit event). Create `POST /reports/:id/versions/:version/share-links` and `DELETE /share-links/:jti`. Port the HMAC-SHA256 token engine to Go, mirroring `web/frontend/src/lib/evidence/token.ts`. Write share link tests. **Gate: close 3 prepaid founding partners ($4,491+ collected).**
6. **Build the worker service (Week 3)** — Create `cmd/worker/main.go` and the extraction, PDF generation, and QA job workers. Connect to River queue. Test job processing end-to-end.
7. **Build the customer portal (Week 3)** — Create `app/dashboard/page.tsx`, `reports/page.tsx`, `reports/[id]/page.tsx`, `audit/page.tsx`, `customers/page.tsx`, `settings/page.tsx`. Implement the audit log viewer. **Gate: 5 paying customers.**
8. **Implement RBAC (Week 3)** — Add `RequireRole` middleware. Enforce role checks on all endpoints: only `author`+ can publish, only `admin`+ can manage users, `reviewer` can approve but not publish. Write RBAC tests.
9. **Add watermarking and export controls (Week 3)** — Modify evidence pages to render a watermark (recipient name + timestamp) when the `watermark` flag is set on the token. Enforce `exportOk` on CSV export. Update `config.ts` with `watermarkEnabled()`.
10. **Add line-chart and table rendering (Week 3)** — Update `SampleReport.tsx` to render `line-chart` (recharts) and `table` (EvidenceGrid). Update `KIND_LABEL` in `app/e/[token]/page.tsx`. Extend manifest tests.
11. **Build the security page (Week 4)** — Create `app/security/page.tsx` explaining the trust model, audit chain, and compliance posture. Update marketing page to link to it.
12. **Implement Stripe billing (Week 4)** — Create `cmd/api/internal/api/billing.go`. Handle `customer.subscription.created`, `invoice.paid`, `customer.subscription.deleted`. Write webhook tests. Create the pricing page.
13. **Set up AWS infrastructure (Week 4–5)** — Write OpenTofu modules: RDS PostgreSQL, ElastiCache Redis, S3, KMS, ECS Fargate, WAF, CloudFront. Create Dockerfiles for API and worker. Set up GitHub Actions CI/CD. Deploy staging environment.
14. **Security hardening and pen test (Week 5)** — Run Trivy, CodeQL, Gitleaks. Engage an independent pen tester. Remediate findings. Document the incident response plan. **Gate: pen test passed.**
15. **SOC 2 Type 1 preparation (Week 5–6)** — Map Trust Services Criteria. Document policies: access control, change management, data retention, incident response. Engage auditor for Type 1 assessment. **Gate: SOC 2 Type 1 readiness.**
16. **CSV and REST adapters (Week 5)** — Harden the CSV ingestion path (already shipped in `lib/upload/parsers.ts`). Add generic REST API ingestion with OAuth 2.0 + API key auth. Test with real partner data.
17. **Embedded report beta (Week 6)** — Add iframe-embeddable evidence pages with `X-Frame-Options: ALLOW-FROM` for approved domains. Document the embed API.
18. **Public launch (Week 6)** — Pricing page, self-serve onboarding (basic), content marketing, MSP community presence. **Gate: 10 paying customers; $7.5k+ MRR; retention >90%.**