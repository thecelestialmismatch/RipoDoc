# RipoDoc Engineering Architecture

## Stack
- **Backend:** Go 1.24+ (Standard library net/http + chi router, pgx + sqlc)
- **Frontend:** Next.js 16.2, React 19.2, TypeScript 5.9, Tailwind CSS 4.1
- **Database:** PostgreSQL 18.4 (Row-Level Security enabled)
- **Background Jobs:** Go + River (Redis-backed queue)
- **PDF Engine:** hand-rolled and dependency-free, in TypeScript (`tools/evidence-pdf/`) — a PDF 1.7 writer, a reader for third-party files, and an incremental-update overlay. Hand-rolled because link annotations and byte preservation are the product's trust boundary and must be auditable without reading someone else's library
- **OCR:** AWS Textract (planned; scanned reports with an existing OCR text layer already work)
- **Infrastructure:** AWS ECS Fargate, RDS PostgreSQL, ElastiCache (Redis), S3, KMS

> **Shipped today:** `web/frontend` (evidence pages) and `tools/` (PDF generator,
> overlay engine, audit verifier). The Go API and worker below are the planned
> shape, not code that exists. This document flags the difference on purpose —
> defence buyers audit everything, and an architecture doc that overstates is
> the cheapest possible way to lose a deal.

## Services
- `cmd/api`: HTTP API server (stateless) — planned
- `cmd/worker`: Background job processor (extraction, mapping, PDF gen, QA) — planned
- `web/frontend`: Next.js application — shipped
- `tools/evidence-pdf`: report generator, overlay engine and CLIs — shipped
- `tools/audit-log`: audit chain verifier — shipped

## Security
- Tenant isolation via PostgreSQL RLS + application middleware
- KMS encryption for all stored data
- Sandboxed PDF processing; bounded parsing of untrusted files
- Hashed, expiring, revocable share links
- Hash-chained append-only audit log (`npm run audit:verify`)
- Customer documents are appended to, never rewritten
