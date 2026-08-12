# RipoDoc PR #9 Security Advisory and Self-Hosted MSP Migration Guide

**Audience:** Self-hosted RipoDoc MSP operators, service owners, and technical contacts  
**Release:** PR #9 (`9a834ff`)  
**Action:** Plan and complete the migration during the next approved maintenance window.

## 1. Advisory Summary

RipoDoc PR #9 materially strengthens the self-hosted product’s security boundaries. The release removes browser-direct access to the PDF authoring worker, retires the legacy deployment-wide administrator access key, introduces individual role-bound operations, and applies least-privilege container controls.

This is a **security hardening release**. Existing self-hosted operators should upgrade rather than retain the legacy browser-visible worker and shared-key administrator paths.

| Change | Customer Benefit | Operator Action |
| --- | --- | --- |
| Private worker capabilities | The browser no longer receives worker credentials or direct worker access. | Set the new private worker authorization secret. |
| Role-bound operations | Administrative actions are attributable to verified `owner` and `admin` users. | Retire old shared-key operating procedures and establish verified operator accounts. |
| Container hardening | Non-root processes, read-only roots, dropped capabilities, health checks, and resource limits reduce attack surface. | Use the delivered Compose file without removing its security options. |
| Supply-chain evidence | Reproducible CycloneDX dependency SBOM and production dependency scans are available. | Run the final-image SBOM and CVE scan in the deployment pipeline. |

## 2. Change Impact and Maintenance Planning

The migration changes the authoring ingress contract and administrator access model. Schedule a maintenance window because active browser authoring sessions may need to be reloaded after services restart.

No destructive database migration is prescribed by this advisory. Nevertheless, take and validate a PostgreSQL backup before changing the deployment. Preserve the worker data volume until post-upgrade evidence publication has been verified.

> Do not copy production secrets into tickets, chat, shell history, screenshots, or source control. Use your organization’s approved secret manager or protected environment file with owner-only access.

## 3. Pre-Migration Checklist

| Step | Required Verification |
| --- | --- |
| 1 | Confirm the current deployed release and create a rollback tag or image digest record. |
| 2 | Back up the `ripodoc-postgres` volume and test a restore in a non-production environment. |
| 3 | Preserve the `ripodoc-worker` volume; do not delete it during the first upgrade. |
| 4 | Confirm a reverse proxy terminates TLS and forwards the canonical HTTPS origin. |
| 5 | Prepare all environment variables listed in Section 4 with newly generated secrets where appropriate. |
| 6 | Confirm individual verified users will hold the `owner` or `admin` workspace role after cutover. |
| 7 | Run the final-image SBOM and vulnerability scan described in `container-sbom-and-vulnerability-scan.md` on your release runner. |

## 4. Required PR #9 Environment Variables

Create a protected `.env.production` file owned by the deployment account, or configure the equivalent secrets in your orchestrator. Use unique values per environment.

```dotenv
# PostgreSQL
POSTGRES_PASSWORD=<long-random-database-password>

# Canonical external service origin
RIPODOC_APP_ORIGIN=https://reports.example-msp.com
RIPODOC_PORT=3000

# RipoDoc security secrets: use distinct, randomly generated 32+ character values.
RIPODOC_AUTH_SECRET=<random-32-plus-character-secret>
RIPODOC_EVIDENCE_SECRET=<random-32-plus-character-secret>
RIPODOC_WORKER_AUTH_SECRET=<random-32-plus-character-secret>

# Email and CAPTCHA configuration
RIPODOC_RESEND_API_KEY=<resend-api-key>
RIPODOC_EMAIL_FROM=security@reports.example-msp.com
RIPODOC_TURNSTILE_SECRET=<turnstile-server-secret>
NEXT_PUBLIC_RIPODOC_TURNSTILE_SITE_KEY=<turnstile-site-key>

# Optional bounded worker concurrency; retain the conservative default unless capacity testing supports a change.
RIPODOC_WORKER_MAX_CONCURRENT_JOBS=2
```

The `RIPODOC_WORKER_AUTH_SECRET` is new to the protected server-to-worker path. It must never be sent to browsers, embedded in front-end assets, or exposed through public configuration endpoints.

## 5. Migration Procedure

### Step 1 — Fetch the signed release source

Check out the PR #9 merge commit or your organization’s reviewed release tag.

```bash
git fetch origin main
git checkout 9a834ff4a309cfedf5544c2094aabf704915870a
```

### Step 2 — Place the protected environment file

Create the environment file outside source-control tracking, apply restrictive permissions, and review variable names against Section 4.

```bash
install -m 700 -d /srv/ripodoc
install -m 600 /dev/null /srv/ripodoc/.env.production
# Edit /srv/ripodoc/.env.production using an approved editor or secret-management workflow.
```

### Step 3 — Render Compose before deployment

Rendering Compose detects missing mandatory configuration before containers are changed.

```bash
docker compose --env-file /srv/ripodoc/.env.production \
  -f docker-compose.selfhost.yml config >/tmp/ripodoc-compose-rendered.yaml
```

Review the rendered file for unexpected public ports. The web service is intended to be the public application endpoint; the worker is restricted to loopback (`127.0.0.1:4000`) and should not receive public firewall exposure.

### Step 4 — Build, scan, and retain provenance

Build the exact release images, generate CycloneDX SBOMs, and scan both final images before starting the services.

```bash
docker compose --env-file /srv/ripodoc/.env.production \
  -f docker-compose.selfhost.yml build web worker

syft <web-image-reference> -o cyclonedx-json > ripodoc-web-pr9.cdx.json
syft <worker-image-reference> -o cyclonedx-json > ripodoc-worker-pr9.cdx.json
grype <web-image-reference> --fail-on high
grype <worker-image-reference> --fail-on high
```

Record the image digests, scanner versions, SBOM files, scan result files, and the approving operator in the change ticket.

### Step 5 — Start the hardened stack

```bash
docker compose --env-file /srv/ripodoc/.env.production \
  -f docker-compose.selfhost.yml up -d

docker compose --env-file /srv/ripodoc/.env.production \
  -f docker-compose.selfhost.yml ps
```

Wait for PostgreSQL, worker, and web health checks to report healthy. Do not work around an unhealthy worker by publishing port 4000 to the public network.

### Step 6 — Validate the production boundary

Run these checks from an approved operator workstation or monitoring runner.

```bash
# Service status: response must not contain credentials, users, reports, or tenant data.
curl --fail --silent --show-error https://reports.example-msp.com/api/health

# Confirm public service is HTTPS.
curl --fail --silent --show-error -I https://reports.example-msp.com/

# Confirm worker is not reachable from the public network.
curl --connect-timeout 3 http://reports.example-msp.com:4000/api/local/health
# Expected: connection failure or network denial.
```

Then sign in as an individual verified `owner` or `admin` user. Confirm `/admin` only displays tenant-scoped summary data and confirm a standard user cannot access the administrative route.

## 6. Customer-Visible Behavior Changes

| Previous Behavior | PR #9 Behavior |
| --- | --- |
| Browser could interact with an authoring worker route. | Browser calls the same-origin application API; server issues a single-use, tenant-bound worker capability. |
| Administrator access could rely on a deployment-level shared key. | Private operations require a verified individual workspace session with `owner` or `admin` role. |
| Worker trust was partly determined by network configuration. | Worker checks purpose, tenant, draft ID, expiry, replay state, and approval integrity before handling a request. |
| Container security settings varied by local deployment. | Delivered Compose configuration defaults to non-root execution, read-only application roots, dropped capabilities, and health checks. |

## 7. Rollback Procedure

If an application-level regression occurs after the upgrade, stop the PR #9 stack, restore the previously documented image digest or source revision, and keep the original `.env` file and volumes intact. Do **not** reuse the legacy shared administrator access key as a workaround. If rollback requires a database restore, use the backup created in Section 3 and document the recovery point objective and resulting evidence/report availability.

```bash
docker compose --env-file /srv/ripodoc/.env.production \
  -f docker-compose.selfhost.yml down
# Restore the reviewed prior release using the organization’s saved revision/digest.
```

## 8. Support Packet for a Security Review

Provide the following items to an MSP customer, insurer, or assessor upon request:

1. The PR #9 commit or release digest.
2. The CycloneDX application and final-image SBOMs.
3. Final-image vulnerability scanner results and exception approvals, if any.
4. The worker-hardening threat model and simulated penetration-test report.
5. Hash-chain audit verification output for the agreed review period.
6. The backup/restore exercise record and current operator access review.

This guide is a deployment and migration aid, not a certification statement. Customer compliance obligations remain shared responsibilities between RipoDoc, the MSP operator, and the customer’s selected hosting environment.
