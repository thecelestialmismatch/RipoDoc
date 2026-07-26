# RipoDoc Engineering Architecture

## Stack
- **Backend:** Go 1.24+ (Standard library net/http + chi router, pgx + sqlc)
- **Frontend:** Next.js 16.2, React 19.2, TypeScript 5.9, Tailwind CSS 4.1
- **Database:** PostgreSQL 18.4 (Row-Level Security enabled)
- **Background Jobs:** Go + River (Redis-backed queue)
- **PDF/OCR Engine:** pdfcpu (manipulation), AWS Textract (OCR/Vision)
- **Infrastructure:** AWS ECS Fargate, RDS PostgreSQL, ElastiCache (Redis), S3, KMS

## Services
- `cmd/api`: HTTP API server (stateless)
- `cmd/worker`: Background job processor (extraction, mapping, PDF gen, QA)
- `web/frontend`: Next.js application

## Security
- Tenant isolation via PostgreSQL RLS + application middleware
- KMS encryption for all stored data
- Sandboxed PDF processing
- Hashed, expiring, revocable share links
- Immutable audit log
