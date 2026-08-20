# RipoDoc–RipoDoc CRM operator and API integration guide

**Status:** Production implementation guide  
**Audience:** RipoDoc application operators, CRM administrators, security reviewers, and platform engineers  
**Scope:** The optional, one-way synchronisation of expressly consented founding-partner leads from RipoDoc to a separately operated RipoDoc CRM instance.

> **Boundary statement:** This integration is a sales-operations connector, not an evidence-delivery integration. RipoDoc CRM must never receive report content, evidence links or tokens, recipient information, audit records, RipoDoc sessions, application secrets, or CRM-unrelated personal data.

RipoDoc can create or update an RipoDoc CRM **Lead** only after a prospect has submitted the founding-partner form, supplied the optional CRM follow-up consent, and the RipoDoc lead has been persisted. RipoDoc uses RipoDoc CRM’s REST API root at `/api/v1/`, a dedicated HMAC-authenticated API user, and an email lookup before a create or update operation. RipoDoc CRM recommends separate API users with role-specific access; its API documentation describes HMAC as its most secure API authentication option.[1]

| Integration property | Implemented behavior | Operator consequence |
| --- | --- | --- |
| Direction | RipoDoc to RipoDoc CRM only | Do **not** configure inbound CRM webhooks for this release. |
| Trigger | A newly submitted, explicitly consented founding-partner lead | A lead that did not consent is never queued for CRM sync. |
| Entity scope | RipoDoc CRM `Lead` only | Grant no unrelated entity scopes. |
| Create/update safety | Lookup by email, then `POST Lead` or `PUT Lead/{id}` | A repeated submission updates the matched Lead instead of intentionally creating a second Lead. |
| Delivery behavior | A CRM error does not change the public form acknowledgement | Operators monitor the outbox rather than asking prospects to retry because of an internal CRM failure. |
| Network model | Outbound HTTPS from RipoDoc only | RipoDoc CRM needs no route into RipoDoc and must not share RipoDoc’s cookie domain or network. |
| Deployment model | Separate host, DNS name, database, volumes, credentials, and TLS proxy | RipoDoc CRM is an independent sales-operations service, not a RipoDoc sidecar. |

## 1. Before you begin

Operate RipoDoc CRM on a persistent Linux host controlled by the organisation. The default task environment is not a production host. The CRM requires a dedicated public hostname, such as `crm.example.com`, and a TLS reverse proxy that forwards only to the loopback-bound RipoDoc CRM service. RipoDoc CRM’s official deployment documentation recommends Docker Compose for production-oriented deployments because it provides more manageable configuration control.[2]

The operator must assign named ownership for CRM administration, backup and restoration, security updates, lead/contact retention, and incident response. The CRM hostname must be different from `www.ripodoc.com`; never place the CRM beneath a shared RipoDoc cookie domain.

| Prerequisite | Required condition | Do not do this |
| --- | --- | --- |
| Host | Persistent Linux host running Docker Compose | Do not deploy the CRM in a short-lived build, preview, or task environment. |
| DNS/TLS | Dedicated DNS hostname with a valid HTTPS endpoint | Do not point RipoDoc at a raw IP address or an HTTP URL. |
| Data store | Dedicated RipoDoc CRM MariaDB volumes and internal network | Do not attach the CRM to RipoDoc PostgreSQL or publish the MariaDB port. |
| Secrets | Independently generated database, administrator, API-key, and HMAC-secret values | Do not reuse RipoDoc evidence, authentication, email, database, or RipoDoc hosted environment secrets. |
| Consent | Reviewed wording and a lawful internal process for sales follow-up in the relevant jurisdictions | Do not sync people who did not explicitly opt in. |
| Access | A least-privileged RipoDoc CRM API user and a normal human administrator account | Do not use the initial administrator account for RipoDoc API calls. |

## 2. Deploy the isolated RipoDoc CRM service

The repository ships the deployment assets at [`deploy/crm/`](../../deploy/crm/). Copy that directory to the separate CRM host; do not place it into the RipoDoc application deployment. The Compose configuration has a loopback-only web binding, an internal database network, persistent CRM and database volumes, and a separate daemon service.

On the CRM host, copy the template, set permissions, replace every example secret with a high-entropy independent value, and pin image references to reviewed versions or immutable digests before production. The shipped template pins the current official `crm/crm:10.0.4-apache` release tag; the operator must still verify the applicable multi-architecture digest before each production deployment and review upgrade notes before changing the pin.

```bash
cd /opt/ripodoc-crm
cp .env.example .env
chmod 600 .env
# Edit .env in the host's approved secret-management workflow.
docker compose --env-file .env config --quiet
docker compose --env-file .env up -d
docker compose --env-file .env ps
```

The CRM-host `.env` has the following purpose. Values beginning `RIPODOC_` must **not** be put in this file; they belong only in the server-side environment of the RipoDoc application.

| Variable | Purpose | Production requirement |
| --- | --- | --- |
| `MARIADB_IMAGE` | MariaDB image reference | Pin to a reviewed version or immutable digest. |
| `CRM_IMAGE` | RipoDoc CRM image reference | Pin to a reviewed version or immutable digest. |
| `CRM_BIND_PORT` | Host loopback port for the CRM web service | Keep loopback-only; the supplied template uses `8088`. |
| `CRM_SITE_URL` | Public HTTPS origin for the RipoDoc CRM interface | Use the dedicated CRM hostname, for example `https://crm.example.com`. |
| `CRM_DATABASE_NAME` and `CRM_DATABASE_USER` | CRM database identity | Keep these dedicated to RipoDoc CRM. |
| `CRM_DATABASE_PASSWORD` | CRM database-user secret | Generate independently and store securely. |
| `CRM_DATABASE_ROOT_PASSWORD` | MariaDB root secret | Generate independently; never use it as an application credential. |
| `CRM_ADMIN_USERNAME` and `CRM_ADMIN_PASSWORD` | Initial bootstrap administrator | Use once to establish ordinary administrators and the restricted API user; rotate according to the operational password policy. |

Configure the TLS reverse proxy to accept the CRM hostname and proxy only to `127.0.0.1:${CRM_BIND_PORT}`. The following Caddy fragment is deliberately minimal; adopt the organisation’s certificate, logging, and network-control standards around it.

```caddyfile
crm.example.com {
    reverse_proxy 127.0.0.1:8088
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "same-origin"
    }
}
```

Once the service is healthy, access only `https://crm.example.com`, complete the initial administrative setup, create normal human operator accounts, and retain the bootstrap credentials only in approved secret storage. RipoDoc CRM documents Docker Compose installation, health checks, maintenance commands, and upgrade procedures in its official Docker guide.[2]

## 3. Create the least-privileged RipoDoc API user

In RipoDoc CRM, use **Administration → Roles** to create a role for the RipoDoc connector. Permit only the Lead operations the connector uses: **read**, **create**, and **edit**. Then use **Administration → API Users** to create a dedicated API user, select **HMAC authentication**, and assign only that role. RipoDoc CRM supports separate API users with roles for this purpose.[1]

| Grant or setting | Required value | Reason |
| --- | --- | --- |
| Entity | `Lead` | The connector reads an existing lead by email and creates or updates that one entity. |
| Lead permission | Read, create, edit | These are the only operations executed. |
| Authentication | HMAC | RipoDoc sends a per-request HMAC authorization header. |
| API key and HMAC secret | Copy to RipoDoc server-side secret storage | They authenticate RipoDoc to RipoDoc CRM and must never reach browser code, the CRM-host `.env`, or source control. |
| All other entities | No permission | Preserves the least-privilege boundary. |
| Administration, settings, users, files, export, webhooks, delete | No permission | These capabilities are neither required nor appropriate for an outbound lead synchroniser. |

The connector requests only these REST operations:

| Purpose | Method and URI relative to `/api/v1/` | Expected result |
| --- | --- | --- |
| Find an existing lead | `GET Lead?searchParams=…` | Zero or one selected Lead id. |
| Create a new lead | `POST Lead` | A JSON response containing the new Lead id. |
| Update an existing lead | `PUT Lead/{id}` | Successful completion for the matched Lead. |

Do not grant delete permissions. Do not add an inbound webhook, a generic API proxy, an attachment permission, or a custom integration field until it has undergone a separate data-minimisation and security review.

## 4. Configure RipoDoc server-side environment

Set the following values only in the protected server-side environment that runs the RipoDoc web application. In RipoDoc hosted environment, use the project’s encrypted environment-variable settings for the intended production environment; never prefix these names with `NEXT_PUBLIC_`.

```dotenv
RIPODOC_CRM_URL=https://crm.example.com
RIPODOC_CRM_ALLOWED_HOSTS=crm.example.com
RIPODOC_CRM_API_KEY=<dedicated-espo-api-user-key>
RIPODOC_CRM_HMAC_SECRET=<dedicated-espo-api-user-hmac-secret>
```

| Variable | Exact validation rule | Operational note |
| --- | --- | --- |
| `RIPODOC_CRM_URL` | Required when any CRM value is present; must be an HTTPS origin with no credentials, path, query, or fragment; its hostname cannot be an IP literal | Example: `https://crm.example.com`, with no trailing path. |
| `RIPODOC_CRM_ALLOWED_HOSTS` | Must resolve to exactly one trimmed hostname and must exactly equal the hostname in `RIPODOC_CRM_URL` | Example: `crm.example.com`; do not supply a wildcard, URL, IP address, or a comma-separated host list. |
| `RIPODOC_CRM_API_KEY` | Required; minimum 24 characters | Copy the key from the dedicated RipoDoc CRM API user. |
| `RIPODOC_CRM_HMAC_SECRET` | Required; minimum 32 characters | Copy the HMAC secret from the same dedicated API user. |

If all three credential/origin variables are absent, the connector is simply disabled. If some—but not all—are present, or any validation rule fails, RipoDoc refuses to send the request and keeps the public founding-partner flow non-disclosing. Configuration is fail-closed: it does not silently downgrade to a weaker endpoint, alternate hostname, HTTP, Basic authentication, or an IP address.

> **Deployment sequence:** Apply the database migration first, deploy the RipoDoc release containing the connector, configure these server-only variables, redeploy or restart the RipoDoc application, and then submit a test contact that you control with the consent box checked. Do not paste secrets into issue trackers, logs, screenshots, client-side configuration, or the RipoDoc CRM Compose file.

## 5. Apply the RipoDoc migration

The schema change is [`migrations/010_create_founding_partner_crm_sync.sql`](../../migrations/010_create_founding_partner_crm_sync.sql). Apply it through the same reviewed PostgreSQL migration process used for the RipoDoc application and only against `RIPODOC_DATABASE_URL`. For an operator whose approved procedure permits direct `psql`, the command is:

```bash
psql --set ON_ERROR_STOP=1 "$RIPODOC_DATABASE_URL" \
  -f migrations/010_create_founding_partner_crm_sync.sql
```

The migration adds a non-null `crm_sync_consent` field to `founding_partner_leads` and creates the separate `founding_partner_crm_syncs` outbox table. It does not modify report, recipient, evidence-token, or audit-chain tables. The outbox has one row per lead, `pending`, `syncing`, `synced`, and `failed` statuses, an attempt count, timestamps, a remote Lead id, and a safe failure code.

| Migration verification | Expected result |
| --- | --- |
| `founding_partner_leads.crm_sync_consent` | Present, `BOOLEAN NOT NULL`, default `FALSE`. |
| `founding_partner_crm_syncs` | Present with a `lead_id` primary key referencing `founding_partner_leads`. |
| Outbox status constraint | Only `pending`, `syncing`, `synced`, or `failed` is accepted. |
| Evidence and audit tables | No CRM fields, privileges, or joins added. |

## 6. API authentication contract

For every CRM request, RipoDoc sends `X-Hmac-Authorization`. The exact header value is:

```text
base64(apiKey + ":" + hex(HMAC-SHA-256(hmacSecret, METHOD + " /" + uri)))
```

For example, `uri` is `Lead` for a create request or `Lead?searchParams=…` for a lookup. The signed string has one space between the uppercase method and the slash: `POST /Lead`. The HMAC digest is represented as hexadecimal text, then the `apiKey:hexDigest` string is Base64-encoded as the header value. This matches RipoDoc CRM’s documented HMAC construction.[1]

| Header or transport control | RipoDoc behavior |
| --- | --- |
| `X-Hmac-Authorization` | Uses the API key and HMAC secret of the dedicated API user. |
| `Accept` and `Content-Type` | Requests and responses use JSON. |
| Base path | Requests go to `/api/v1/`; RipoDoc CRM documents this as its REST API root.[1] |
| TLS | HTTPS only. |
| Timeout | Five seconds per request. |
| Redirects | Not followed. |
| DNS | The allowlisted hostname is resolved immediately before each request and pinned into the TLS request. |
| Address filtering | Loopback, private, link-local, carrier-grade NAT, multicast, documentation, and IPv4-mapped IPv6 destinations are rejected. |

## 7. Data contract and privacy boundary

The CRM payload is intentionally small. RipoDoc maps the consented lead to RipoDoc CRM’s `firstName`, `lastName`, `emailAddress`, `accountName`, and `description` fields. The description carries limited qualification context and the internal founding-partner lead reference; it is not an evidence or customer-data channel.

| Sent to RipoDoc CRM | Why it is sent | Never sent to RipoDoc CRM |
| --- | --- | --- |
| First and last name | Identify the sales contact | RipoDoc passwords, session identifiers, CSRF values, CAPTCHA responses, or login data |
| Work email | Lookup and contact the lead | Customer/recipient names, recipient email data, recipient hashes, or IP addresses |
| MSP or company name | Associate the Lead with the prospect’s organisation | Reports, report ids, report source rows, uploaded PDFs, files, or attachments |
| Company-size band | Prospect qualification | Evidence token values, token ids, URLs, links, HMACs, or secrets |
| Reporting-tool band and preferred operating model | Product discovery and follow-up context | Evidence-access audit events, audit-chain data, access attempts, or delivery records |
| Acquisition source and RipoDoc lead reference | Attribution and support correlation | RipoDoc PostgreSQL credentials, RipoDoc hosted environment secrets, email credentials, or CRM host secrets |

The public form itself validates and persists the lead before any CRM attempt. Only a submission with explicit CRM consent produces a syncable lead record. A CRM error is deliberately not exposed to the prospect, and connector code does not log credentials or contact values.

## 8. Verification procedure

Use a controlled business contact and a non-production route first if one is available. Do not test with a customer recipient, an evidence-delivery address, or any person who has not agreed to testing.

1. Confirm `docker compose --env-file .env ps` shows the RipoDoc CRM and MariaDB services healthy on the separate host.
2. Confirm `https://crm.example.com` serves the CRM interface and that the RipoDoc environment uses the same hostname in both CRM origin settings.
3. Verify the migration in the RipoDoc database.
4. Submit the founding-partner form using a contact you control and tick the optional CRM follow-up consent checkbox.
5. In RipoDoc CRM, confirm exactly one **Lead** appears with only the permitted fields in the data-boundary table.
6. In the RipoDoc outbox, confirm the row reaches `synced` and records the remote Lead id.
7. Submit the same controlled email again, with consent. Confirm the existing RipoDoc CRM Lead is updated rather than intentionally duplicated.
8. Remove or anonymise the test Lead according to the organisation’s documented test-data-retention procedure; do not grant RipoDoc delete permission to automate that cleanup.

The repository’s mock-server integration suite independently verifies the same lookup/create, lookup/update, HMAC header, least-data payload, remote-rejection, timeout, and unclaimed-outbox behavior. Run the complete release gate with:

```bash
npm run verify
```

At the time this guide was updated, the suite contained **171 passing tests**, including five mock-server RipoDoc CRM integration cases. The production build is part of the same command.

## 9. Observability and operator queries

The outbox is the authoritative RipoDoc-side sync record. Query it only from an authorised operations connection to the RipoDoc PostgreSQL database. Do not export or join additional lead data merely to troubleshoot routine sync status.

```sql
SELECT
    lead_id,
    provider,
    status,
    remote_lead_id,
    attempt_count,
    last_attempt_at,
    synced_at,
    failure_code,
    created_at,
    updated_at
FROM founding_partner_crm_syncs
ORDER BY updated_at DESC
LIMIT 100;
```

For a single lead, replace the value below with the RipoDoc lead UUID from an authorised operational record:

```sql
SELECT
    lead_id,
    status,
    remote_lead_id,
    attempt_count,
    last_attempt_at,
    synced_at,
    failure_code,
    updated_at
FROM founding_partner_crm_syncs
WHERE lead_id = '<authorised-lead-uuid>';
```

| Status | Meaning | Correct operator response |
| --- | --- | --- |
| `pending` | Consent was persisted and an outbox row exists, but no successful claim/attempt has been recorded | Check application configuration and the controlled trigger path before treating it as a transport failure. |
| `syncing` | An attempt holds the atomic claim | Wait for completion. A claim becomes eligible for a new attempt only after it is stale for 15 minutes and the sync workflow is invoked again. |
| `synced` | RipoDoc recorded a successful RipoDoc CRM response and remote Lead id | Check the Lead in RipoDoc CRM only when needed for sales operations. |
| `failed` | The most recent attempt failed safely | Read `failure_code`, inspect authorised CRM/application operational logs, correct the cause, then use the controlled re-attempt procedure below. |

The current connector performs an attempt while processing the consented submission; it does **not** include a background outbox-draining worker or an operator API that replays every failed row. Therefore, changing a row in PostgreSQL does not itself send a CRM request, and merely adding credentials will not retrospectively drain historical pending rows. The atomic outbox claim and 15-minute stale-claim window make re-invocation safe, but a broad automatic replay mechanism requires a separately reviewed and implemented worker. This limitation is intentional and must be accounted for in the operating procedure.

## 10. Failure codes, recovery, and troubleshooting

The outbox stores only two public-safe failure classifications. It does not store remote response content, contact values, or credentials.

| Failure code | Classification rule | Common causes | Recovery procedure |
| --- | --- | --- | --- |
| `remote_rejected` | An RipoDoc CRM response with HTTP status `400–499` | Invalid Lead payload, missing required CRM field, invalid/expired HMAC credentials, insufficient role, or an RipoDoc CRM conflict | Check the RipoDoc CRM API user, its HMAC secrets, Lead role permissions, and RipoDoc CRM logs. Correct the server-side cause without changing the data boundary. Use a controlled consented test submission to confirm a new attempt succeeds. |
| `transport_failed` | DNS errors, rejected addresses, TLS/connectivity errors, timeouts, invalid JSON, or any non-4xx remote condition including `5xx` | CRM endpoint unavailable, reverse-proxy/TLS error, DNS drift to a blocked address, firewall egress issue, request longer than five seconds, or CRM server failure | Check CRM uptime, certificate chain, public DNS, reverse-proxy route, firewall egress, and CRM service logs. Correct availability, then perform the controlled test submission. |

> **No customer-data diagnostic logging:** Do not paste request headers, API keys, HMAC secrets, full payloads, CRM response bodies, or evidence-related data into tickets. Correlate only with authorised timestamps, the RipoDoc `lead_id`, and the RipoDoc CRM Lead id where available.

| Symptom | Diagnosis | Resolution |
| --- | --- | --- |
| No outbox row after form submission | The prospect did not select CRM consent, the request failed before persistence, or the database migration is missing | Confirm the consent checkbox was selected; verify the migration and normal form-operability checks. Do not manually create an outbox row for a person without consent. |
| Outbox remains `pending` | CRM configuration was absent/invalid when the public request was handled, or the sync path was not invoked | Validate all four RipoDoc environment variables and redeploy. Because this release has no sweeper, verify remediation with a controlled new consented submission. |
| `remote_rejected` | RipoDoc CRM received and refused the request | Confirm the dedicated HMAC API user and Lead read/create/edit role; inspect RipoDoc CRM logs for the authorised request timestamp. |
| `transport_failed` | RipoDoc did not receive a usable successful CRM response | Verify HTTPS, public DNS, address filtering, reverse proxy, egress, and the five-second response budget. |
| CRM URL rejected before a request | URL is HTTP, contains a path/query/credentials, is an IP, or hostname/allowlist do not exactly match | Use one bare HTTPS origin and the one identical DNS hostname in `RIPODOC_CRM_ALLOWED_HOSTS`. |
| Lead appears twice | Someone created a duplicate outside the connector, CRM duplicate rules differ, or email values differ materially | Compare authorised Lead email values and consolidate in RipoDoc CRM. RipoDoc’s connector looks up the submitted email before create/update; do not solve duplicates by granting delete to the connector. |
| Public form says received but CRM has no Lead | This is expected when CRM is unconfigured, unavailable, or rejects an attempt; public acknowledgement is intentionally non-disclosing | Inspect the outbox and authorised infrastructure logs. Do not ask the prospect to reveal additional information. |

## 11. Security controls summary

| Control | Implementation |
| --- | --- |
| Consent gate | CRM synchronization is available only for the optional, explicitly consented founding-partner path. |
| Least data | The payload is limited to basic business-contact and qualification data; all evidence, recipient, authentication, audit, and secret data is excluded. |
| Least privilege | A dedicated HMAC API user has only Lead read/create/edit permission. |
| Server-only secrets | API credentials reside only in RipoDoc server-side configuration. |
| Strong transport | HTTPS is required; non-HTTPS endpoints and URL credentials are refused. |
| Host allowlist and DNS pinning | One configured hostname must match exactly; it is resolved before each request and rejected if any result is internal or otherwise blocked. |
| SSRF resistance | IP literals, loopback, private, link-local, carrier-grade NAT, multicast, documentation, and IPv4-mapped IPv6 destinations are blocked; redirects are not followed. |
| Bounded availability risk | Each CRM request has a five-second timeout and an external failure cannot change the public lead-intake acknowledgement. |
| Concurrency and idempotency | Atomic outbox claiming, an attempt counter, a 15-minute stale-claim window, and email lookup before create/update limit duplicate work. |
| Isolation | RipoDoc CRM runs on a separate host, hostname, database, credentials, volumes, and reverse-proxy boundary; no inbound CRM access to RipoDoc is required. |

## 12. Routine maintenance and change control

Maintain the CRM as an independent production system. Before an image upgrade, back up the RipoDoc CRM database and application/custom volumes using the organisation’s encrypted backup procedure, test restoration in an isolated environment, retain a known-good image reference, and execute the upgrade in a reviewed change window. RipoDoc CRM documents Compose-based maintenance and upgrade workflows, including service status and log commands.[2]

Rotate the HMAC API credentials when staff roles change, compromise is suspected, or the organisation’s secret-rotation schedule requires it. Update the RipoDoc CRM API user and RipoDoc server environment together, redeploy RipoDoc, and run the controlled verification procedure. Never rotate by temporarily enabling Basic authentication or by moving secrets into browser-visible variables.

> **Change-control stop condition:** Any proposal to add evidence data, recipient data, attachments, inbound webhooks, new CRM entity permissions, bulk replay, automated contact enrichment, or a shared database/network is outside this guide’s boundary. It requires a new data-flow review, privacy/counsel review where applicable, security design, tests, and an explicit release decision.

## References

[1]: https://docs.crm.com/development/api/ "RipoDoc CRM — API overview and HMAC authentication"
[2]: https://docs.crm.com/administration/docker/installation/ "RipoDoc CRM — Installation with Docker"
