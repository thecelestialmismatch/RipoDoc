# RipoDoc Deployment Runbook

**Current deployment model:** Next.js web application plus a separately deployed, private PDF authoring worker.
**Primary operations procedure:** [`self-hosted-operations-runbook.md`](self-hosted-operations-runbook.md).
**Worker security design:** [`../05-security/worker-hardening-threat-model.md`](../05-security/worker-hardening-threat-model.md).

> This document is the concise release path. The companion operations runbook contains first deployment, backup/restore rehearsal, secret rotation, rollback, incident response, and decommissioning procedures.

## Current topology

| Service | Public exposure | Authorization boundary | Current state |
| --- | --- | --- | --- |
| Next.js web application | HTTPS reverse proxy or Vercel | Workspace session, CSRF guard, tenant-scoped data helpers, recipient mailbox proof | Shipped |
| Private PDF authoring worker | Internal Compose network and optional loopback host port only | Short-lived, single-use, purpose- and tenant-bound HMAC capability issued by the trusted web service | Shipped |
| PostgreSQL | Internal Compose network only | Database authentication plus application tenant queries; durable users, sessions, tokens, rate limits, and report metadata | Shipped |
| Go/River managed architecture | Not deployed in this repository | Planned managed-service architecture only | Planned, not a present security claim |

The browser never receives the worker URL or its authorization secret. The web application calls the worker through server-only `RIPODOC_LOCAL_WORKER_URL` and `RIPODOC_WORKER_AUTH_SECRET`; direct browser, unsigned, replayed, wrong-purpose, and cross-tenant worker requests are rejected.

## Public Vercel release

1. Run the complete release gate from the repository root.

   ```bash
   npm run verify
   npm run lint
   npm audit --omit=dev
   ```

2. Push a reviewed merge to `main`. The connected Vercel project deploys the public web application.

3. Configure server-only Vercel values before enabling workspace account actions. At minimum, configure `RIPODOC_DATABASE_URL`, `RIPODOC_AUTH_SECRET`, `RIPODOC_EVIDENCE_SECRET`, `RIPODOC_APP_ORIGIN`, Resend, and Turnstile. The hosted application intentionally fails closed for account actions when these durable prerequisites are absent.

4. Keep `RIPODOC_LOCAL_WORKER_URL` and `RIPODOC_WORKER_AUTH_SECRET` server-only. A public Vercel deployment should not proxy customer PDFs to an untrusted, internet-facing worker.

5. Verify the public routes, the no-store `/api/health` response, unauthenticated redirects for `/dashboard` and `/admin`, safe `/security` posture, and no broken public navigation. Perform authenticated/authoring smoke tests only in a properly configured environment with no customer data used as a test fixture.

## Self-hosted release

The Compose bundle starts PostgreSQL, the web service, and the private worker. It exposes the web service to the configured host port, keeps PostgreSQL internal, and binds the worker host port to loopback. Web and worker run as non-root, use read-only root filesystems with temporary `tmpfs` mounts, drop Linux capabilities, and report health checks.

```bash
# Required variables are documented in README.md and the operations runbook.
docker compose -f docker-compose.selfhost.yml config
docker compose -f docker-compose.selfhost.yml up --build -d
docker compose -f docker-compose.selfhost.yml ps
```

A healthy deployment must meet the following release gates.

| Gate | Evidence |
| --- | --- |
| Source correctness | `npm run verify` passes strict type checking, all regression tests, and the production build. |
| Dependency posture | `npm audit --omit=dev` has no known production vulnerabilities. |
| Compose rendering | `docker compose ... config` resolves required values and shows no public PostgreSQL port or public worker port. |
| Health | Web `/api/health` and host-local worker `/api/local/health` return only safe status data. |
| Browser boundary | `/upload` talks to same-origin `/api/authoring/*`; it has no browser-visible worker URL or credential. |
| Operator boundary | `/admin` requires an individually attributable, verified workspace `owner` or `admin` session and renders tenant-scoped, privacy-safe data only. |
| Worker boundary | Direct browser, missing/forged/replayed/wrong-purpose capability, and cross-tenant artifact requests fail without exposing artifact data. |
| Recovery readiness | Current database backup, restore-rehearsal record, image/commit rollback target, and secret-rotation procedure are available. |

## Configuration ownership

RipoDoc supplies application-level controls, but the MSP operating the deployment remains responsible for TLS, HSTS policy, encrypted volumes and backups, network segmentation, host/container patching, reverse-proxy rules, database availability, monitoring, alerting, retention, incident response, and any required compliance certification. Do not make certification, encryption-at-rest, managed queue, or high-availability claims solely from this repository unless the deployment evidence supports them.

## References

- [`README.md`](../../README.md)
- [`self-hosted-operations-runbook.md`](self-hosted-operations-runbook.md)
- [`../05-security/worker-hardening-threat-model.md`](../05-security/worker-hardening-threat-model.md)
- [`../../docker-compose.selfhost.yml`](../../docker-compose.selfhost.yml)
