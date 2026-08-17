# RipoDoc Self-Hosted Operations Runbook

**Applies to:** The Compose deployment defined in [`docker-compose.selfhost.yml`](../../docker-compose.selfhost.yml).  
**Operational model:** The MSP operates the host, reverse proxy, storage encryption, backup system, monitoring, network controls, and secret manager. RipoDoc provides the web application, PostgreSQL schema, private authoring worker, and release validation procedures.

> **Do not expose the worker to the public internet.** The web service is the only browser-facing service. The worker binds its host port to loopback and accepts only a short-lived, single-use, tenant-bound capability issued by the trusted web service.

## Service topology and responsibility split

| Component | Exposure | Identity and data boundary | Operator responsibility |
| --- | --- | --- | --- |
| `web` | Public only through the operator’s HTTPS reverse proxy | Verified workspace sessions, recipient proof, tenant-scoped report queries, same-origin authoring gateway | TLS, reverse-proxy security headers/HSTS, DNS, WAF/rate policy, runtime secrets, monitoring |
| `worker` | Internal Compose network and `127.0.0.1:4000` only | Server-issued 90-second, single-use, purpose-limited capability; tenant metadata; digest-bound review | Keep private, retain volume encryption, set capacity, monitor health/logs, rotate worker secret with web service |
| `postgres` | Compose network only; no host port | Users, tenant/session state, one-time codes, rate limits, workspace reports, recipient proof | Encrypted volume/backups, access restriction, backup/restore, capacity, PostgreSQL lifecycle |
| Volumes | Host-local named volumes | PostgreSQL durable records and worker draft/artifact state | Encryption at rest, backup retention, access control, secure deletion |

The bundled containers run as a non-root `ripodoc` user, use read-only root filesystems where compatible, mount bounded temporary filesystems, drop Linux capabilities, and set conservative Compose resource limits. These settings reduce blast radius; they do **not** replace host patching, encrypted volumes, network segmentation, backup testing, or monitoring.

## 1. First deployment

### Prepare a controlled host

Install a supported Docker Engine with Compose, Git, and a reverse proxy that terminates TLS. Restrict the deployment directory to the operator account and place runtime secrets in a host-managed secret store or a local `.env` file with mode `600`. Never commit `.env`, send it in tickets, or copy it into client-report storage.

```bash
git clone https://github.com/thecelestialmismatch/RipoDoc.git
cd RipoDoc
chmod 700 .
umask 077
```

Create `.env` with distinct cryptographically random values. `RIPODOC_AUTH_SECRET`, `RIPODOC_EVIDENCE_SECRET`, and `RIPODOC_WORKER_AUTH_SECRET` must all be different. Generate `RIPODOC_LEAD_ENCRYPTION_KEY` as a separate base64url-encoded 32-byte key; it encrypts the founding-partner contact address at rest and must never be reused for sessions, evidence, or worker capabilities. The worker secret is not an evidence-signing secret and must never appear in a browser-visible `NEXT_PUBLIC_*` variable.

```dotenv
POSTGRES_PASSWORD=<long-random-database-password>
RIPODOC_AUTH_SECRET=<distinct-32-or-more-character-random-secret>
RIPODOC_EVIDENCE_SECRET=<distinct-32-or-more-character-random-secret>
RIPODOC_WORKER_AUTH_SECRET=<distinct-32-or-more-character-random-secret>
# Generate with: openssl rand -base64 32 | tr '+/' '-_' | tr -d '='
RIPODOC_LEAD_ENCRYPTION_KEY=<distinct-base64url-encoded-32-byte-key>
RIPODOC_APP_ORIGIN=https://reports.example-msp.com
RIPODOC_RESEND_API_KEY=re_<provider-key>
RIPODOC_EMAIL_FROM=RipoDoc <reports@example-msp.com>
RIPODOC_TURNSTILE_SECRET=<turnstile-secret>
NEXT_PUBLIC_RIPODOC_TURNSTILE_SITE_KEY=<turnstile-site-key>
RIPODOC_PORT=3000
# Optional anonymous field-performance logging. Disabled unless both values are true.
RIPODOC_WEB_VITALS_LOG=false
NEXT_PUBLIC_RIPODOC_WEB_VITALS_ENABLED=false
RIPODOC_WORKER_MAX_CONCURRENT_JOBS=2
```

Start the services and verify Compose state. The command must never reveal the `.env` contents in shell history or logs.

```bash
docker compose -f docker-compose.selfhost.yml pull
docker compose -f docker-compose.selfhost.yml up --build -d
docker compose -f docker-compose.selfhost.yml ps
docker compose -f docker-compose.selfhost.yml logs --tail=100 postgres web worker
```

The expected topology has no published PostgreSQL port, a web port on `${RIPODOC_PORT:-3000}`, and a worker port bound only to `127.0.0.1:4000`. Publish only the web port through the HTTPS reverse proxy. Configure the reverse proxy to redirect HTTP to HTTPS, preserve the canonical host, set an appropriate HSTS policy after the domain is stable, and proxy only to the web service.

### Initial verification

| Check | Command or action | Expected result |
| --- | --- | --- |
| Compose rendering | `docker compose -f docker-compose.selfhost.yml config` | Required variables resolve; no unexpected host ports appear. |
| Web health | `curl --fail https://reports.example-msp.com/api/health` | No-store JSON health response with safe configuration indicators only. |
| Worker health | `curl --fail http://127.0.0.1:4000/api/local/health` from the host | Safe `ripodoc-private-worker` response. |
| Network boundary | Inspect `docker compose ps` and host firewall | Worker remains loopback-only; PostgreSQL has no host port. |
| Identity | Signup, inbox verification, login, logout | Generic responses, verified-email gate, private session, and working logout. |
| Operations role | Sign in as a verified `owner` or `admin` | `/admin` renders only tenant-scoped, privacy-safe operational data. |
| Authoring boundary | Use a verified tenant operator through `/upload` | Browser talks only to `/api/authoring`; unsigned/direct worker requests are rejected. |
| Durable audit chain | `RIPODOC_AUDIT_BACKEND=postgres` is present in the Compose web service; run `npm run preflight:production` from the reviewed source with the production environment. | Preflight confirms database reachability and the durable audit schema. For a self-hosted file-chain deployment, run `npm run audit:verify -- --path <durable-log-path>`. |
| Founding-partner intake | Open `/founding-partners` only after production preflight is ready. | Form is protected by same-origin CSRF, CAPTCHA, rate limits, encrypted contact storage, and generic responses. |

## 2. Routine operations and observability

Monitor service health, restart count, database space, worker volume space, worker queue pressure, and reverse-proxy certificate renewal. Worker logs contain event name, request correlation ID, time, and coarse safe outcome only; they must not be treated as an evidence store and must not contain secret material, tokens, report rows, recipient addresses, PDFs, or raw parser failures.

| Signal | Meaning | Immediate response |
| --- | --- | --- |
| `web` unhealthy | Public application cannot serve health/auth/workspace routes | Inspect container status and reverse proxy; do not bypass configuration guards. |
| `worker` unhealthy | Private authoring unavailable | Keep public evidence serving available; inspect worker volume, limits, and sanitized logs. |
| Worker `429` response | Concurrency cap is reached | Wait/retry, assess queued work, increase capacity only after load review. |
| Repeated authorization failure | Invalid, expired, replayed, wrong-purpose, or cross-tenant capability | Treat as a security signal; preserve correlation IDs, inspect web/worker clock sync and access path. |
| Audit verification failure | Integrity chain discontinuity or storage issue | Preserve storage snapshot, stop claiming verified audit integrity, investigate before cleanup. |

The public `/api/health` endpoint is a deployment probe, not a diagnostics console. It must never be extended to reveal customer data, worker URLs, worker credentials, session state, recipient records, audit events, secret presence by name, or stack traces.

### Optional anonymous Web Vitals measurement

The application can emit first-party field measurements for `CLS`, `FCP`, `INP`, `LCP`, and `TTFB` only when **both** `NEXT_PUBLIC_RIPODOC_WEB_VITALS_ENABLED=true` and `RIPODOC_WEB_VITALS_LOG=true` are set. The public flag is a **build argument** in `docker-compose.selfhost.yml`, so rebuild the web image after changing it: `docker compose -f docker-compose.selfhost.yml up --build -d`.

The endpoint accepts a small, validated JSON payload and writes only metric name, numeric value, rating, navigation type, and timestamp to application logs. It intentionally does **not** log visitor identifiers, recipient identity, report identifiers, URLs, tokens, source rows, evidence content, or raw user-agent strings. The feature is disabled by default. Operators are responsible for deciding whether this narrow operational telemetry is compatible with their privacy notice, analytics governance, and log-retention policy.

## 3. Backup and restore rehearsal

Back up PostgreSQL regularly using a consistent dump or provider-managed snapshot. Backups are sensitive because they include identity, tenant, rate-limit, one-time-token hashes, and workspace report state. Back up the worker volume only when an operator elects to retain in-progress proposals or temporary downloadable artifacts; the default artifact lifetime is bounded, so worker backups should not become indefinite report archives.

```bash
# PostgreSQL logical backup. Store the output in encrypted, access-controlled storage.
docker compose -f docker-compose.selfhost.yml exec -T postgres \
  pg_dump -U ripodoc ripodoc > ripodoc-$(date +%F).sql

# Verify the dump is non-empty without printing its content.
test -s ripodoc-$(date +%F).sql
```

Restore rehearsals must occur in an isolated environment with an isolated origin, separate secrets, disabled outbound email, and no production recipients. Create a disposable PostgreSQL service, restore the dump, run schema/health checks, and verify that no production reverse proxy or sender identity is used. Record the restore time, errors, operator, data age, and result.

## 4. Upgrade and rollback

Before any upgrade, read the release notes, create a database backup, record the current Git commit and image IDs, run the local release gate, and schedule a rollback window. The release is not complete until the web health endpoint, private worker health endpoint, authenticated workspace path, and authorized authoring path are checked.

```bash
# Capture the known-good baseline.
git rev-parse HEAD
docker compose -f docker-compose.selfhost.yml images

# Validate source before changing the running deployment.
npm run verify
npm run lint
npm audit --omit=dev
# With the reviewed production environment loaded, verify durable dependencies.
npm run preflight:production

# Apply a reviewed release.
git pull --ff-only
docker compose -f docker-compose.selfhost.yml up --build -d
```

If the release fails, return to the previously recorded commit or immutable image reference, restore the database only when schema/data state requires it, and re-run the initial verification checks. Do not roll back only the web service if a migration or compatibility change requires a paired rollback plan.

## 5. Secret rotation and emergency session response

| Secret or event | Rotation/action | Required validation |
| --- | --- | --- |
| `RIPODOC_WORKER_AUTH_SECRET` | Rotate web and worker together during a controlled restart. Existing capabilities expire within 90 seconds. | Verified authoring works after restart; old capabilities fail. |
| `RIPODOC_EVIDENCE_SECRET` | Plan a controlled migration/reissue strategy because existing evidence tokens are signed with this secret. Do not rotate blindly. | Existing client evidence-link impact is understood and documented before rotation. |
| `RIPODOC_AUTH_SECRET` | Coordinate with session and one-time-token invalidation expectations; rotate with a user session reauthentication plan. | New login works; old sessions/tokens behave according to the documented invalidation plan. |
| `RIPODOC_LEAD_ENCRYPTION_KEY` | Plan a controlled record re-encryption migration before changing the key. Do not rotate by replacing the value alone, because existing encrypted contact records must remain decryptable during the transition. | An approved key-version migration has completed and authorized contact retrieval remains available. |
| Database password | Rotate in the secret store and Compose configuration, restart dependent services, and verify connection health. | Web/database health and migration state pass. |
| Suspected account compromise | Disable/revoke affected sessions in PostgreSQL through an approved incident procedure; preserve audit evidence. | Account cannot resume access without a fresh, verified authentication flow. |
| Worker or host compromise | Isolate the host, preserve relevant encrypted volumes/logs, rotate worker/auth/evidence secrets as appropriate, and reissue affected reports/links after impact analysis. | New clean host passes the full initial verification procedure. |

## 6. Decommissioning and retention

Before decommissioning, export only records required by contractual/legal retention obligations, revoke active sessions and evidence links as appropriate, disable DNS/reverse-proxy routes, stop services, securely delete encrypted backups/volumes according to the MSP retention policy, and record the date, operator, scope, and proof of disposal. RipoDoc does not decide retention periods for the MSP; this must be documented in the operator’s client agreement and information-security policy.

## References

- [`docker-compose.selfhost.yml`](../../docker-compose.selfhost.yml)
- [`docker/web.Dockerfile`](../../docker/web.Dockerfile)
- [`docker/local/Dockerfile`](../../docker/local/Dockerfile)
- [`docker/local/server.mjs`](../../docker/local/server.mjs)
- [`web/frontend/src/app/api/authoring/[action]/route.ts`](../../web/frontend/src/app/api/authoring/[action]/route.ts)
- [`docs/05-security/worker-hardening-threat-model.md`](../05-security/worker-hardening-threat-model.md)
