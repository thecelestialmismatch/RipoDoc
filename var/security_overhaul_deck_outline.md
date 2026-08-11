# RipoDoc Security Overhaul and Deployment Results

## Cover

**RipoDoc Security Overhaul**

*Hardened identity, scoped evidence delivery, self-hosted control, and verified release readiness.*

## Slide 1

**The release moved security into the product boundary**

- The production release pairs evidence-aware PDF delivery with protected workspace access.
- Signed evidence claims now require recipient mailbox proof before evidence is rendered.
- The product remains deployable as a three-service self-hosted package.

## Slide 2

**Identity is now a durable, fail-closed service**

- TypeScript and Next.js App Router keep sensitive identity logic server-side.
- PostgreSQL persists tenants, users, opaque sessions, rate limits, audit events, and one-time codes.
- Missing durable dependencies cause hosted account actions to fail closed.

## Slide 3

**Five attack paths received specific controls**

- Enumeration: one generic response, a dummy scrypt verification, and a 900 ms response floor.
- Automation: privacy-hashed address/IP rate limits and production Turnstile verification.
- Unauthorized activation: verified email is mandatory before a user can sign in.
- Password compromise: scrypt with random salts and constant-time verification.
- Reset takeover: random 32-byte codes, HMAC storage, atomic single use, 30-minute expiry, and no URL exposure.

## Slide 4

**Evidence delivery is recipient-scoped and auditable**

- PDF links are signed, recipient-hash-bound, time-bound, and revocable.
- Mailbox proof creates a short-lived, scoped proof cookie before one evidence element is revealed.
- Workspace report downloads require verified session plus tenant ownership.
- Access results are recorded before evidence rows render.

## Slide 5

**Self-hosted by design, not as an afterthought**

- Docker Compose launches PostgreSQL, web application, and local PDF worker.
- PostgreSQL is network-internal; the authoring worker maps only to 127.0.0.1:4000.
- Required secrets and external identity delivery settings block unsafe startup.
- The web service starts only after PostgreSQL passes its health check.

## Slide 6

**Operators can deploy in six disciplined steps**

- Prepare a managed Docker host and restricted repository directory.
- Create a root-owned `.env` with unique secrets and canonical HTTPS origin.
- Build and run Compose; confirm healthy services and loopback worker binding.
- Terminate TLS at the MSP reverse proxy; do not expose the worker publicly.
- Verify account lifecycle, mailbox delivery, dashboard authorization, and worker publication.
- Back up PostgreSQL before every update; rebuild and run the release gate.

## Slide 7

**133 automated tests protect the critical boundaries**

- 57 tests validate reviewed overlay publication; 27 harden PDF construction and delivery.
- 16 test evidence authorization and expiry; 16 test manifest and fixture validation.
- 11 verify the hash-chained audit trail; 5 cover authentication/runtime/admin primitives.
- One end-to-end worker test proves reviewed PDF publication; strict type checks and production build pass.

## Slide 8

**The audit is transparent about remaining operational work**

- Implemented: CSRF, opaque sessions, query parameterization, browser headers, production dependency remediation.
- Partial: full database ownership for legacy evidence paths, strict CSP/HSTS operations, worker CORS/auth, uploads, and DoS controls.
- Findings present: raw worker error detail, at-rest encryption requirements, entitlement enforcement, and worker queue controls.
- The 20-control report is audit-only: findings are documented without silent scope changes.

## Slide 9

**The customer, dashboard, and operator experience are now intentional**

- Dashboard: tenant-only report registry, publication metrics, latest publication state, guided first-report workflow, and verified profile context.
- Customer evidence app: a guided mailbox-proof flow, clear scope/expiry receipt, provenance, and approved source rows.
- Private operator console: control-attention strip, safe deployment posture, and recent publication activity.
- `/api/health` supplies safe, no-store readiness indicators for monitoring.

## Slide 10

**Release gate: passed and ready for controlled rollout**

- `npm run verify`: 133 passing tests, strict TypeScript, and successful production Next.js build.
- `npm run lint`: passed; `npm audit --omit=dev`: 0 vulnerabilities.
- Pull request #7 is merged; Vercel deployment for the hardened baseline completed successfully.
- Next execution priority: remediate the documented worker findings with queued, authenticated PDF processing and sanitized operational errors.
