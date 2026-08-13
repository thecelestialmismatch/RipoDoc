# RipoDoc Engineering Architecture

## Purpose and scope

RipoDoc is a secure reporting-delivery and evidence layer for MSPs. It preserves a normal PDF as the delivery artifact while allowing an authorized recipient to open an expiring, recipient-bound, revocable, audit-logged evidence view for an approved figure. This document describes the shipped Node/Next.js architecture; it does not describe an unimplemented alternate backend.

## Shipped architecture

| Layer | Current implementation | Security boundary |
|---|---|---|
| Public application | Next.js 16 App Router, React 19, TypeScript, Tailwind, deployed on Vercel. | Public pages expose only safe status; browser clients never receive worker credentials or evidence-signing secrets. |
| Identity and workspace | Custom scrypt password hashing, opaque PostgreSQL sessions, HMAC CSRF, generic enumeration-safe messages, verification/reset codes stored as hashes, and optional Cloudflare Turnstile. | Verified, tenant-scoped workspace identity; production remains fail-closed until durable configuration is present. |
| Data store | PostgreSQL through parameterized `pg` queries and transactions. | Tenant-scoped report queries; rate limits, sessions, one-time tokens, recipient challenges, leads, and optional durable audit records are server-only. |
| Private authoring worker | Node runtime in `docker/local/server.mjs`. | The server issues a short-lived, single-use, tenant-bound HMAC capability. The worker is not browser-addressable. |
| Evidence delivery | Server-rendered `/e/[token]/[elementId]` routes and HMAC-SHA-256 evidence tokens. | Tokens bind report, recipient hash, expiry, JTI, and permitted scope; revocation is checked before evidence render. |
| PDF tooling | Dependency-minimized TypeScript PDF writer and byte-preserving overlay tooling in `tools/evidence-pdf`. | PDFs receive HTTPS link annotations; source rows are delivered only after evidence authorization and are never embedded in the PDF. |
| Audit | Hash-chained JSONL audit log with stdout sink; optional transactional PostgreSQL chain for durable hosted deployments. | Audit writes occur at the protected server boundary, without token secrets or raw recipient data in events. |
| Self-hosting | Hardened Compose configuration with non-root containers, read-only filesystems, bounded resources, private network isolation, and health checks. | MSP operators retain responsibility for their own hosting, processor chain, backups, email, and access controls. |

## Request paths

1. A workspace user authenticates through same-origin forms. The server verifies CSRF and session state, scopes data to the user’s tenant, and enforces the user’s role.
2. The browser calls the server-side authoring gateway only. The gateway verifies a verified workspace session, role, same-origin CSRF, configured private-worker boundary, and (when enabled) Healthcare Mode B restrictions.
3. The gateway mints a short-lived capability for one worker action, tenant, user, and optional draft. The private worker consumes the capability once and refuses browser-direct or replayed requests.
4. A publication creates controlled PDF/evidence artifacts. Evidence recipients prove control of the intended email when that challenge is configured; the evidence route validates scope, token, expiry, revocation, recipient proof, and access policy before rendering.
5. Audit events are appended to the selected hash chain. The public health route exposes readiness booleans only, not configuration values, tenants, reports, or audit contents.

## Current operational posture

The public Vercel surface is intentionally not the PDF-processing plane. It can serve the website and safe control surfaces, but hosted identity, email, Turnstile, durable audit, prospect intake, and private authoring must remain unavailable until the production preflight verifies their dependencies.

Healthcare Mode B is a restricted evaluation/self-hosted posture. It is not HIPAA certification and does not permit PHI/ePHI through public hosted intake, authoring, analytics, or webhooks. A separate contractual, subprocessor, risk-analysis, and security gate is required for any future regulated-data use.

## Non-goals and planned work

RipoDoc does not currently expose a public Go API, WorkOS authentication, Stripe billing, AWS OCR, generalized customer webhooks, or a public PDF-processing endpoint. These are not product capabilities and must not be claimed in customer or investor material. Any future provider integration must use a dedicated design, security review, data classification, and release gate.

## Verification references

- [`authentication-and-test-coverage.md`](../05-security/authentication-and-test-coverage.md)
- [`worker-hardening-threat-model.md`](../05-security/worker-hardening-threat-model.md)
- [`self-hosted-operations-runbook.md`](./self-hosted-operations-runbook.md)
- [`counsel-review-launch-policy-packet.md`](../06-legal/counsel-review-launch-policy-packet.md)
