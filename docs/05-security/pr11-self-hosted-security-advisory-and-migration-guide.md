# RipoDoc PR #11 Customer Security Advisory and Self-Hosted MSP Migration Guide

**Audience:** Self-hosted RipoDoc MSP operators, service owners, technical contacts, and customer security reviewers.  
**Release:** PR #11, merge commit [`8ad40eb`](https://github.com/thecelestialmismatch/RipoDoc/commit/8ad40eb48c5d4906ea25bff6efbcf01a02ade4d5).  
**Action required:** Upgrade during the next approved maintenance window.  
**Security status:** Final web and private-worker images built successfully, passed runtime smoke tests, and returned **0 critical / 0 high** findings in the PR #11 final-image scan.

## 1. What PR #11 Changes

PR #11 completes the self-hosted container remediation identified during the PR #9 and PR #10 hardening work. It corrects the web image’s runtime manifest layout, removes an invalid runtime dependency copy, prunes development-only frontend dependencies after the production build, and removes the unused npm/npx command-line payload from both production containers. The web container now starts Next.js directly with Node; the private worker already starts directly with Node.

These changes preserve the security model delivered in PR #9: browser requests do not receive worker credentials, the worker accepts short-lived single-use tenant-bound server capabilities, publication rechecks the approved artefacts, and private operations use verified individual owner/admin workspace roles rather than a deployment-wide shared administrator key.

| PR #11 improvement | Customer benefit | MSP operator action |
| --- | --- | --- |
| Corrected runtime manifest layout | The self-hosted web image now builds with the configured `/app/content/reports` manifest root. | Upgrade both services together; do not copy files into containers manually. |
| Corrected dependency layout | The image no longer attempts to copy a non-existent root dependency directory. | Build from the reviewed PR #11 source or immutable release image. |
| Production dependency pruning | Development-only packages do not remain in the web runtime. | Retain the delivered Dockerfile; do not replace it with a single-stage build. |
| Removed unused npm/npx runtime payload | Final images avoid unnecessary package-manager attack surface. | Start services through Compose; do not add npm back to runtime images. |
| Final-image evidence | Exact-build web and worker scans returned 0 critical / 0 high findings. | Rebuild, generate SBOMs, and scan your own exact deployment images before cutover. |

## 2. Shared-Responsibility Boundary

RipoDoc supplies the reviewed source, secure-by-default Compose configuration, application checks, SBOM procedures, and container scan procedure. The MSP operator is responsible for the production reverse proxy and TLS, operating-system security, secret custody, PostgreSQL backup/restore validation, administrator lifecycle, final-image provenance, firewall policy, monitoring, and incident handling.

> This guide is a deployment and migration aid. It is not an ISO 27001 certification, a SOC 2 Type II report, a penetration-test certificate, or a substitute for the operator’s own change-control process.

## 3. Required Pre-Upgrade Checks

Complete every item before stopping the current deployment.

| Step | Verification |
| ---: | --- |
| 1 | Record the current source revision or image digest and create a rollback reference. |
| 2 | Back up the PostgreSQL volume and validate a restore in a non-production environment. |
| 3 | Preserve the worker data volume through the first successful post-upgrade publication. |
| 4 | Confirm the external canonical origin uses HTTPS and the reverse proxy does not expose worker port `4000`. |
| 5 | Confirm all secret values are stored in an approved secret manager or a deployment-owned file with mode `0600`. |
| 6 | Confirm at least one verified workspace user has the required `owner` or `admin` role. |
| 7 | Confirm the host can run the current Docker Engine/Compose release and has sufficient capacity for the configured resource limits. |
| 8 | Schedule the change because active authoring sessions should be reloaded after the web and worker restart. |

## 4. Required Server-Side Configuration

Create a protected environment file outside the source repository. Do not place secrets in tickets, browser-visible environment variables, Dockerfiles, shell histories, screenshots, or client PDFs.

```dotenv
# PostgreSQL and canonical public origin
POSTGRES_PASSWORD=<long-random-database-password>
RIPODOC_APP_ORIGIN=https://reports.example-msp.com
RIPODOC_PORT=3000

# Separate 32+ character server-only secrets
RIPODOC_AUTH_SECRET=<unique-random-secret>
RIPODOC_EVIDENCE_SECRET=<unique-random-secret>
RIPODOC_WORKER_AUTH_SECRET=<unique-random-secret>

# Durable account and recipient-proof delivery
RIPODOC_RESEND_API_KEY=<resend-api-key>
RIPODOC_EMAIL_FROM=security@reports.example-msp.com
RIPODOC_TURNSTILE_SECRET=<turnstile-server-secret>
NEXT_PUBLIC_RIPODOC_TURNSTILE_SITE_KEY=<turnstile-site-key>

# Keep the conservative default unless capacity testing supports a change.
RIPODOC_WORKER_MAX_CONCURRENT_JOBS=2
```

The worker URL and `RIPODOC_WORKER_AUTH_SECRET` are server-only values. Never add either to a `NEXT_PUBLIC_*` variable or a browser configuration object.

## 5. PR #11 Migration Procedure

### Step 1 — Obtain the reviewed source

```bash
git fetch origin main
git checkout 8ad40eb48c5d4906ea25bff6efbcf01a02ade4d5
```

### Step 2 — Protect the environment file

```bash
install -m 700 -d /srv/ripodoc
install -m 600 /dev/null /srv/ripodoc/.env.production
# Edit only through your approved secret-management workflow.
```

### Step 3 — Render Compose before changing services

```bash
docker compose --env-file /srv/ripodoc/.env.production \
  -f docker-compose.selfhost.yml config >/tmp/ripodoc-compose-pr11.yaml
```

Review the rendered output. PostgreSQL must remain internal to the Compose network; worker port `4000` must remain loopback-only and must not be exposed by an external firewall or reverse proxy.

### Step 4 — Build final images, create SBOMs, and scan

Use the images created from your exact source checkout. Retain the generated artefacts with the change record.

```bash
docker compose --env-file /srv/ripodoc/.env.production \
  -f docker-compose.selfhost.yml build web worker

# Substitute the exact local or registry image references produced by the build.
syft <web-image-reference> -o cyclonedx-json > ripodoc-web-pr11.cdx.json
syft <worker-image-reference> -o cyclonedx-json > ripodoc-worker-pr11.cdx.json
trivy image --severity HIGH,CRITICAL --ignore-unfixed <web-image-reference>
trivy image --severity HIGH,CRITICAL --ignore-unfixed <worker-image-reference>
```

Do not cut over with an unreviewed high or critical finding. If a finding is accepted temporarily, document its package, severity, exposure analysis, compensating control, accountable approver, and expiry date.

### Step 5 — Start the hardened stack

```bash
docker compose --env-file /srv/ripodoc/.env.production \
  -f docker-compose.selfhost.yml up -d

docker compose --env-file /srv/ripodoc/.env.production \
  -f docker-compose.selfhost.yml ps
```

Wait for the web, worker, and database health checks. Do not weaken `read_only`, `cap_drop`, `security_opt`, temporary filesystem, network, or resource-limit settings merely to bypass a configuration problem; investigate the configuration instead.

### Step 6 — Verify the boundary and customer workflow

```bash
# Safe public web-health response: no tenant, recipient, report, session, or secret data.
curl --fail --silent --show-error https://reports.example-msp.com/api/health

# TLS response check.
curl --fail --silent --show-error -I https://reports.example-msp.com/

# Public worker reachability must fail. Do not expose port 4000.
curl --connect-timeout 3 http://reports.example-msp.com:4000/api/local/health
```

Then complete the following controlled tests with dedicated operator and test-recipient accounts:

1. Confirm a verified owner/admin can reach `/admin` and sees only tenant-scoped operational summary data.
2. Confirm a standard user is denied administrative access.
3. Create a non-production sample authoring draft and confirm browser authoring uses the same-origin application path, not a worker URL.
4. Publish a test report, retrieve the approved artefact, and complete the intended-recipient proof flow.
5. Revoke a designated test evidence link according to the approved operator procedure and verify it returns the recipient-safe revocation outcome.

## 6. Rollback

If there is an application-level regression, stop the PR #11 stack, restore the previously documented image digest or source revision, and keep the environment file, PostgreSQL volume, and worker volume intact. Do not reintroduce the retired shared administrator key or publish worker port `4000` as a workaround.

```bash
docker compose --env-file /srv/ripodoc/.env.production \
  -f docker-compose.selfhost.yml down
# Restore the organization’s reviewed prior release revision or image digest.
```

If a database restore is required, use the tested backup created during pre-upgrade work and document the recovery point, the affected reporting period, and client communication plan.

## 7. Security Review Packet

Retain or provide the following items for customer due diligence, insurer review, or an assessment request:

1. PR #11 source commit or registry image digests.
2. Final-image CycloneDX SBOMs and the scanner outputs.
3. The PR #11 live boundary verification report.
4. The worker-hardening threat model and worker integration-test evidence.
5. Evidence-token signing, expiry, and JTI-revocation regression output.
6. Hash-chain audit verification output for the agreed time window.
7. Backup/restore exercise evidence and current owner/admin access review.
8. Change approval and, if relevant, documented risk acceptances with expiry dates.
