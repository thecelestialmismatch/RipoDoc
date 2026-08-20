# RipoDoc sales CRM: isolated RipoDoc CRM deployment

This directory deploys an **independent RipoDoc CRM sales-operations service** for RipoDoc. It is intentionally not part of the RipoDoc application stack. The CRM may hold consented business-development leads and follow-up workflow; it must never hold evidence-link tokens, recipient proof, report source rows, customer evidence, RipoDoc session data, or RipoDoc application secrets.

> **Deployment boundary:** Run this Compose project on a persistent host with a separate hostname, storage volumes, database, administrator account, backups, and reverse-proxy configuration. The task sandbox is not a valid production CRM host.

## Architecture

| Surface | Purpose | Isolation rule |
| --- | --- | --- |
| `crm.example.com` | RipoDoc CRM operator interface and RipoDoc outbound API target | Separate hostname and TLS endpoint; never share the RipoDoc cookie domain. |
| `database` | RipoDoc CRM MariaDB only | Internal Docker network; no published database port. |
| `crm` | CRM web/API application | Loopback-only port; TLS terminates at a separately managed proxy. |
| `daemon` | RipoDoc CRM scheduled/background work | Shares only RipoDoc CRM application volumes, not RipoDoc volumes or networks. |
| RipoDoc app | Optional outbound lead sync | Server-side HTTPS only; least-privileged RipoDoc CRM API user; no inbound CRM access is required. |

## Before you deploy

The operator must own and control all of the following.

| Prerequisite | Required action |
| --- | --- |
| Persistent Linux host with Docker Compose | Do not deploy the CRM in an ephemeral environment. |
| DNS and TLS | Create a dedicated hostname such as `crm.example.com`; configure a TLS reverse proxy to forward to `127.0.0.1:8088`. |
| Independent secrets | Generate distinct database, root database, and CRM administrator secrets. Never reuse `RIPODOC_EVIDENCE_SECRET`, application auth keys, PostgreSQL URL, email credentials, or RipoDoc hosted environment secrets. |
| Operational ownership | Assign a CRM administrator, backup owner, update owner, and retention/contact-data owner. |
| Legal and consent decision | Use the RipoDoc consent checkbox only when the lead agrees to CRM follow-up. Review privacy wording with counsel for the jurisdictions in which you operate. |

## Deploy

1. Copy the deployment directory to the separate CRM host. Copy `.env.example` to `.env`, then set the dedicated domain and independent secrets. Restrict it with `chmod 600 .env`.
2. Replace the example image values with reviewed version tags or immutable image digests before production. The official documentation uses Docker Compose as the production-oriented installation approach. [1]
3. Configure the host reverse proxy. A minimal Caddy example is below; adapt it to the existing infrastructure and certificate policy.
4. Validate the rendered Compose configuration: `docker compose --env-file .env config --quiet`.
5. Start the service: `docker compose --env-file .env up -d`.
6. Confirm `docker compose ps` shows healthy CRM and database services, then visit the HTTPS CRM hostname.
7. Log in with the initial administrator only long enough to create ordinary CRM users, a restricted integration role, and a dedicated API user. Change the initial administrator password according to the operational password policy.

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

The Compose configuration deliberately publishes only a loopback web port; the MariaDB service has no host port.

## Create the RipoDoc integration API user

RipoDoc CRM recommends a separate API user with role-scoped permissions for API calls. It supports HMAC authentication, which RipoDoc uses for this integration. [2]

Create a dedicated role that permits only the minimum Lead operations required by the integration: **read, create, and edit**. Do not grant administration, user management, settings, file access, export, webhook management, delete, or unrelated entity scopes. Then create an API user using **HMAC authentication**, attach that role, and copy its API key and HMAC secret into the RipoDoc application environment—not this CRM `.env` file.

Set the following server-only RipoDoc variables:

```dotenv
RIPODOC_CRM_URL=https://crm.example.com
RIPODOC_CRM_ALLOWED_HOSTS=crm.example.com
RIPODOC_CRM_API_KEY=<dedicated-espo-api-user-key>
RIPODOC_CRM_HMAC_SECRET=<dedicated-espo-api-user-hmac-secret>
```

The connector requires an HTTPS origin with exactly one explicitly allowlisted DNS hostname. Before every CRM request, it resolves the hostname and rejects loopback, private, link-local, carrier-grade NAT, multicast, documentation, and IPv4-mapped IPv6 destinations. Redirect following is not enabled. A five-second timeout bounds the request.

## Consent and data contract

A sync occurs only after the prospect checks the optional **CRM follow-up consent** box and RipoDoc has successfully persisted the founding-partner lead. The CRM payload contains only the following fields:

| Sent to RipoDoc CRM | Never sent to RipoDoc CRM |
| --- | --- |
| Name, work email, MSP/company name, company-size band, reporting-tool band, operating-model preference, acquisition source, and an internal founding-partner lead reference | Report ids, report content, customer names, source rows, recipient data, recipient hashes, evidence links, token values, token ids, audit records, login/session data, attachments, RipoDoc secrets, or IP addresses |

The RipoDoc database records a consent flag and a sync outbox row. The outbox claim is atomic, retries stale in-progress claims after 15 minutes, and performs an email-based CRM lookup before create/update, so an uncertain network outcome cannot create a duplicate lead on retry.

## Database migration

Apply `migrations/010_create_founding_partner_crm_sync.sql` through the same controlled PostgreSQL migration process used for the RipoDoc application. It adds an explicit `crm_sync_consent` field and a separate `founding_partner_crm_syncs` outbox table. It does not modify evidence audit records or recipient-token tables.

## Verification and operations

After both services are configured, submit a **test business contact that you control** and explicitly opt into CRM follow-up. Confirm one Lead appears in RipoDoc CRM, the lead contains only the allowed payload above, and the RipoDoc sync row is `synced`. Repeat the submission to confirm the existing Lead is updated rather than duplicated.

If the CRM is unavailable, malformed, unconfigured, or rejects a request, RipoDoc still acknowledges the founding-partner request without disclosing an internal failure. The outbox records a safe status only; credentials and contact values are never logged by the connector. Investigate through the CRM service logs and the RipoDoc database under authorized operator access.

Back up the MariaDB volume and RipoDoc CRM data/custom volumes using the operator’s encrypted backup procedure. Test restoration in an isolated environment. Update images through a reviewed change window, verify the health checks, and retain a known-good image reference for rollback. The official Docker documentation includes maintenance and upgrade procedures. [1]

## Webhooks

The initial connector is intentionally one-way: RipoDoc creates or updates only consented Leads. Do not configure inbound RipoDoc CRM webhooks unless a later use case requires it. RipoDoc CRM supports signed webhooks, but a receiving endpoint would need its own authentication, signature validation, replay protection, idempotency, allowlist, and data-minimization review. It must never target an evidence, recipient-proof, authentication, or audit endpoint. [3]

## References

[1]: https://docs.crm.com/administration/docker/installation/ "RipoDoc CRM — Installation with Docker"
[2]: https://docs.crm.com/development/api/ "RipoDoc CRM — API Overview"
[3]: https://docs.crm.com/administration/webhooks/ "RipoDoc CRM — Webhooks"
