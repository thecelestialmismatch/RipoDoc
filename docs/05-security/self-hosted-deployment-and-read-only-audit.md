# Self-Hosted Deployment Guide and Read-Only Security Audit

**Maintainer:** Manus AI  
**Assessment date:** 12 August 2026 (GMT+10)  
**Assessment scope:** RipoDoc commit `a0a04dd`; code and configuration review only.  
**Change rule:** The audit table below records findings and recommendations only. It does **not** change implementation for Phase 2.

## Self-hosted deployment architecture

RipoDoc ships a three-service Compose topology designed for MSP-controlled operation. PostgreSQL holds identity, tenant, session, rate-limit, one-time-code, recipient-proof, and report metadata. The Next.js web service exposes the authenticated workspace and recipient experience. The PDF authoring worker remains a separate process with a loopback-only host binding, so report authoring is not silently exposed as a public SaaS upload endpoint.[1]

| Service | Purpose | Exposure | Durability and startup guard |
| --- | --- | --- | --- |
| `postgres` | Stores durable workspace and authentication state. Loads migrations only on first volume initialization. | Compose network only; no published host port. | Persistent `ripodoc-postgres` volume and `pg_isready` health check. |
| `web` | Runs the Next.js public site, secured workspace, report manifest route, and email-backed auth flows. | `${RIPODOC_PORT:-3000}:3000`; place it behind an HTTPS reverse proxy. | Starts only after PostgreSQL reaches its healthy state. |
| `worker` | Produces reviewed PDF overlays and handles only local authoring artifacts. | `127.0.0.1:4000:4000`; unavailable from remote clients by default. | Persistent `ripodoc-worker` volume and explicit trusted-origin setting. |

> **Operational boundary.** The authoring worker must remain behind the MSP’s controlled network boundary. It authorizes browser origins explicitly, but origin matching is not a substitute for user authentication or a perimeter control.[1] [2]

## Deployment procedure

### 1. Prepare the host and repository

Use a current Docker Engine with Docker Compose v2, Git, and a TLS reverse proxy that you operate. Clone the repository on a managed Linux host and restrict the working directory to the operator account. Do not place secrets in shell history, source control, screenshots, or support tickets.

```bash
git clone https://github.com/thecelestialmismatch/RipoDoc.git
cd RipoDoc
chmod 700 .
```

### 2. Create the runtime environment file

Create a root-owned `.env` file with mode `600`. Generate unique database, authentication, and evidence-signing secrets; never reuse the public app origin as a secret. The `RIPODOC_APP_ORIGIN` value must be the exact public HTTPS origin configured in the reverse proxy and in Cloudflare Turnstile.

```bash
cat > .env <<'EOF'
POSTGRES_PASSWORD=replace-with-a-long-random-value
RIPODOC_AUTH_SECRET=replace-with-a-distinct-32-or-more-character-random-value
RIPODOC_EVIDENCE_SECRET=replace-with-a-distinct-32-or-more-character-random-value
RIPODOC_APP_ORIGIN=https://reports.example-msp.com
RIPODOC_RESEND_API_KEY=re_xxxxxxxxx
RIPODOC_EMAIL_FROM=RipoDoc <reports@example-msp.com>
RIPODOC_TURNSTILE_SECRET=replace-with-turnstile-secret
NEXT_PUBLIC_RIPODOC_TURNSTILE_SITE_KEY=replace-with-turnstile-site-key
RIPODOC_PORT=3000
NEXT_PUBLIC_LOCAL_API=https://reports.example-msp.com/api/local
EOF
chmod 600 .env
```

The Compose file rejects startup if required secrets are missing. PostgreSQL receives only its own password; the web service receives the database URL and auth/email configuration; and the worker receives only the evidence secret and exact trusted origin.[1]

### 3. Build and start the platform

```bash
docker compose -f docker-compose.selfhost.yml pull
docker compose -f docker-compose.selfhost.yml up --build -d
docker compose -f docker-compose.selfhost.yml ps
docker compose -f docker-compose.selfhost.yml logs --tail=100 web worker postgres
```

The expected state is a healthy PostgreSQL container plus running `web` and `worker` services. The worker’s host port should display as `127.0.0.1:4000`, not `0.0.0.0:4000`.[1]

### 4. Terminate TLS at the reverse proxy

Publish only the web service through an HTTPS reverse proxy, configure HTTP-to-HTTPS redirects, and forward the canonical host without rewriting it. Set `RIPODOC_APP_ORIGIN` to the same HTTPS origin. Do **not** publish the worker port to the internet. If operator browsers need the worker API, route it through an authenticated private network or a tightly scoped reverse-proxy path that preserves the configured origin; it is not a public customer API.

### 5. Verify the secure deployment

Perform an unauthenticated health check only from the host, then complete the account flow from a browser using a real email inbox. Confirm that signup returns its generic outcome, verification is required before sign-in succeeds, the dashboard redirects unauthenticated requests to sign-in, and a customer report can be created only through the reviewed worker publication path.

```bash
curl --fail http://127.0.0.1:4000/api/local/health
npm run verify
```

The production deployment must also have valid Resend sender verification and correct Cloudflare Turnstile domain registration. Account endpoints fail closed when the durable configuration is absent.[3]

### 6. Back up, update, and restore

Back up the PostgreSQL volume or a consistent `pg_dump`, and preserve the `ripodoc-worker` volume only when in-progress local authoring artifacts must be retained. Treat both backups as sensitive because they contain workspace and report-related data. Before an update, take a database backup, pull the tagged or reviewed commit, rebuild, run `npm run verify`, and restart the Compose stack. Test a restoration into an isolated environment before relying on it operationally.

```bash
docker compose -f docker-compose.selfhost.yml exec -T postgres \
  pg_dump -U ripodoc ripodoc > ripodoc-$(date +%F).sql

git pull --ff-only
docker compose -f docker-compose.selfhost.yml up --build -d
```

## Read-only 20-control security audit

The status values distinguish **Implemented**, **Partially mitigated**, and **Finding present**. A partial status means protections exist but do not cover every relevant boundary. The recommended actions are not applied by this audit.

| # | Control | Status | Evidence and specific location | Recommended next action |
| ---: | --- | --- | --- | --- |
| 1 | Missing CSRF protection on state-changing endpoints | **Implemented** | `web/frontend/src/lib/auth/server.ts:49-58` verifies canonical origin and a constant-time double-submit token; `web/frontend/src/app/api/auth/[action]/route.ts:20-26` rejects failures; `web/frontend/src/app/api/evidence/proof/route.ts:18-21` applies the same guard. | Preserve this guard on every future state-changing route; add route-level tests when new endpoints are added. |
| 2 | Insecure session management | **Implemented** | `web/frontend/src/lib/auth/server.ts:9-15, 37-45` sets opaque cookies as `HttpOnly`, `SameSite=Strict`, production `Secure`, and eight-hour limited. `web/frontend/src/lib/auth/service.ts:171-194` stores only a HMAC hash and supports revocation. | Add optional device/session management UI and high-risk re-authentication for future administrative mutation actions. |
| 3 | Broken access control | **Partially mitigated** | Tenant workspace manifest downloads are scoped in `web/frontend/src/app/api/reports/[reportId]/route.ts:9-22`; however recipient evidence loads published filesystem manifests at `web/frontend/src/app/api/evidence/proof/route.ts:24-25`, and the legacy operator console reads global manifests in `web/frontend/src/app/admin/page.tsx:26`. | Move published evidence ownership and recipient grants fully into PostgreSQL, then apply role and tenant checks to every control-plane query. |
| 4 | SQL injection or unsafe query construction | **Implemented** | `web/frontend/src/lib/auth/database.ts:13-29` sends SQL values separately through `pg`; auth service queries use placeholders, including `service.ts:31-40, 62, 181-189`. | Keep query parameters separate from SQL. Add an automated static review rule to reject template interpolation of untrusted values. |
| 5 | Missing input validation or sanitization | **Partially mitigated** | Auth input is normalized/validated in `primitives.ts:29-37`, and manifest validation is enforced in the workspace loader; the worker’s draft `PUT` accepts arbitrary JSON at `docker/local/server.mjs:136-139`. | Validate all worker draft updates and published manifests against the canonical schema before persistence; enforce a server-side allowlist for the publication origin and TTL. |
| 6 | Sensitive data exposure in logs or error responses | **Finding present** | The evidence audit suite protects raw recipient email, but worker handlers return raw exception details at `docker/local/server.mjs:204-208, 231-233, 254-257, 299-301`. | Log a correlation identifier and sanitized diagnostic server-side; return a generic public error with the correlation ID only. |
| 7 | Insecure direct object references | **Partially mitigated** | Tenant report retrieval is ownership-scoped at `api/reports/[reportId]/route.ts:9-22`; evidence links are deliberately signed bearer capabilities with additional mailbox proof, but the worker exposes ID-addressable drafts behind origin matching at `docker/local/server.mjs:93-149`. | Bind worker artifacts to an authenticated operator/tenant identity, maintain per-artifact authorization, and retain the existing evidence proof gate. |
| 8 | Missing or weak security headers | **Partially mitigated** | Middleware sets CSP, frame denial, no-referrer, permissions, nosniff, COOP, and CORP at `middleware.ts:9-35`. The CSP permits `'unsafe-inline'` styles and `'unsafe-inline' 'unsafe-eval'` scripts, and HSTS is not set in the application layer. | Remove unsafe CSP directives where the production build permits; set HSTS at the HTTPS reverse proxy with an appropriate rollout/`includeSubDomains` decision. |
| 9 | Hardcoded secrets, API keys, or credentials | **Implemented** | Secrets are environment-required in `docker-compose.selfhost.yml:8, 29-36`; authentication rejects weak/missing secret configuration in `primitives.ts:20-27`. | Add secret-scanning to CI and rotate secrets through deployment configuration rather than source changes. |
| 10 | Outdated or vulnerable dependencies | **Implemented** | The hardened release’s production `npm audit --omit=dev` result is zero known vulnerabilities; package release gate is defined in `package.json:10-28`. | Add scheduled dependency review and block releases on new production high/critical advisories. |
| 11 | Insecure CORS configuration | **Partially mitigated** | Worker CORS reflects only an exact `RIPODOC_ALLOWED_ORIGIN` match at `docker/local/server.mjs:34-49, 75-82`; CORS does not itself identify a user and allowed methods are broad. | Keep the loopback publish binding, add authentication for operator routes, and narrow methods per endpoint if a remote worker deployment becomes necessary. |
| 12 | Missing server-side validation of client-provided data | **Partially mitigated** | Auth routes use server-side validation; worker upload validates presence and ID shape at `server.mjs:164-183`, but the raw worker manifest is persisted before explicit canonical schema parsing at `185-190`. | Parse and validate every worker manifest with the canonical `parseManifest` server-side before writing or invoking the overlay tool. |
| 13 | Improper error handling or leaked internals | **Finding present** | Worker exception details are sent to the caller at `server.mjs:204-208, 231-233, 254-257, 299-301`. | Replace raw exception responses with generic messages and a request ID; preserve sanitized stack/context only in protected structured logs. |
| 14 | Missing audit logging on sensitive actions | **Partially mitigated** | Authentication writes audit events in `auth/service.ts:43-49`; evidence access uses the hash-chained logger. Worker draft, upload, review, and download events do not write the same audit trail. | Record immutable, privacy-safe worker publication and artifact-download events to the established audit sink. |
| 15 | Insecure file upload handling | **Partially mitigated** | Worker enforces 50 MB PDF and 5 MB proposal limits at `server.mjs:164-168, 211-214`, plus ID/path restrictions at `51-60`; it does not verify PDF magic bytes before processing and does not apply malware scanning. | Check PDF magic bytes and parser sanity before copy/processing, write uploads with restrictive permissions, expire artifacts, and add an appropriate malware/content-scanning control for the MSP environment. |
| 16 | Missing encryption for sensitive data at rest | **Finding present** | JSON manifests and worker artifacts persist on named volumes at `docker-compose.selfhost.yml:56-61`; filesystem store writes readable JSON manifests in `web/frontend/src/lib/evidence/store.ts:82-93`. | Encrypt database and volume storage at the infrastructure layer, use a managed KMS/key rotation policy, and consider application-level field encryption for especially sensitive metadata. |
| 17 | Weak or missing TLS enforcement | **Partially mitigated** | `middleware.ts:21` upgrades insecure browser requests, `auth/email.ts:1-7` rejects non-HTTPS production origins, but Compose does not include a TLS termination service and the local worker uses loopback HTTP. | Terminate TLS in the documented reverse proxy, configure HSTS there, prohibit public worker exposure, and monitor certificate renewal. |
| 18 | Business-logic flaws or price/plan gate bypass | **Finding present** | No billing, entitlement, quota, or $499 report-gate enforcement exists in the current product routes or schema. | Implement server-authoritative plans, payment-provider webhooks, entitlement checks in the report-publication transaction, and audit events for all entitlement decisions. |
| 19 | Denial-of-service vectors | **Partially mitigated** | Auth is rate-limited at `auth/service.ts:64-70`; worker PDF processing has only file-size limits and invokes expensive overlay CLI work at `server.mjs:164-208, 237-258` without rate limits, queueing, or CPU/time ceilings. | Add authenticated worker access, per-tenant/IP request limits, a bounded job queue, execution timeout, concurrency cap, disk quota, and cleanup policy. |
| 20 | Insecure default configuration | **Partially mitigated** | Auth fails closed when core configuration is absent in `primitives.ts:26-27`; production CAPTCHA is required. However the worker defaults to `http://localhost:3000` at `server.mjs:34`, and non-production may explicitly enable CAPTCHA bypass in `auth/captcha.ts:3-6`. | Keep bypass impossible in production, require an explicit development profile, ensure reverse-proxy TLS/HSTS configuration is operationally mandatory, and remove permissive defaults from remote deployment templates. |

## Audit conclusion

The release substantially improves the identity and evidence-delivery boundary: authentication, sessions, basic authorization, database query safety, and browser hardening are materially implemented. The remaining material issues concentrate in the separately hosted PDF authoring worker and in operational controls: raw worker error detail, lack of worker authentication/audit coverage, strong but incomplete upload validation, at-rest encryption, queue/rate-limit controls for expensive PDF work, and missing entitlement enforcement. These findings are intentionally recorded without modifying Phase 2 code.

## References

[1]: ../../docker-compose.selfhost.yml "RipoDoc self-hosted Compose topology"
[2]: ../../docker/local/server.mjs "RipoDoc local authoring worker"
[3]: ../../web/frontend/src/lib/auth/primitives.ts "RipoDoc authentication configuration guard"
