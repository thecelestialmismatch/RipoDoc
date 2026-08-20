# RipoDoc Worker-Boundary Threat Model and Hardening Acceptance Criteria

**Status:** Implementation baseline for the next hardening release.  
**Scope:** The self-hosted Node.js authoring worker, its browser ingress, the Next.js proxy surface, and the resulting report artifacts.  
**Evidence baseline:** `main` at `f316e1e` (PR #8), reviewed 12 August 2026 (GMT+10).

> This document separates the **shipped local authoring worker** from the longer-term managed Go/River design described in the engineering architecture. It does not claim that planned services or infrastructure controls are already implemented.

## Trust boundaries

| Boundary | Legitimate actor | Protected asset | Approved flow | Non-negotiable rejection rule |
| --- | --- | --- | --- | --- |
| Recipient evidence | Intended report recipient | One approved evidence element and its source rows | Signed claim, valid report state, recipient mailbox proof, short-lived proof cookie, scoped render, audit record | A bearer PDF link alone must not render evidence. Invalid, expired, revoked, or wrong-recipient proof must reveal no element data. |
| Tenant workspace | Verified tenant user | Tenant reports, manifests, report metadata, download access, and workspace history | Server-side verified session followed by tenant-scoped query and no-store response | A report identifier, draft identifier, URL parameter, or client-supplied tenant field must never authorize access. |
| Private authoring worker | Authenticated tenant operator through a trusted server-side gateway | Unpublished PDFs, manifests, placement proposals, reviewed approvals, clickable artifacts, worker storage, and CPU/disk capacity | Purpose-limited, short-lived server-issued credential; authenticated ownership check; bounded processing; immutable review evidence | Browser CORS, a static browser-visible URL, a draft ID, a filename, or approver strings must never authorize a worker action. |
| Private operations control plane | Individually authenticated authorized operator | Tenant posture, session inventory, worker health, security events, revocations, and audit integrity state | Per-user server session plus role/tenant authorization, privacy-safe queries, audited state changes | A shared access key, client-side control, or public health output must never expose or mutate sensitive operational state. |

## Assets, adversaries, and abuse cases

| Asset | Credible adversary or failure | Current baseline risk | Required control in this release |
| --- | --- | --- | --- |
| Unpublished drafts and source PDFs | Network-adjacent user, malicious local user, forwarded worker URL, or compromised browser | Worker accepts unauthenticated calls and list/read access is based only on filesystem IDs | Signed short-lived service capability, tenant/operator binding, opaque internal IDs, owner check on every operation, private network/loopback deployment |
| Review approval | User editing a JSON proposal before upload | `approvedBy` and `approvedAt` are attacker-controlled strings | Durable authenticated reviewer identity, server-generated timestamp, canonical proposal/PDF/manifest digest, immutable approval record, publish-time digest recheck |
| Host filesystem and worker process | Malformed upload, parser edge case, high-volume request, or disk exhaustion | File size is capped, but magic bytes, structural limits, concurrency, artifact lifetime, and generic error handling are incomplete | Signature/structure checks, page and stream limits, quotas, bounded queue/concurrency, expiry cleanup, generic public errors, correlation logging |
| Evidence signing secret | Accidental log/error output or insecure worker invocation | Worker requires the secret, but raw errors can be returned to callers | Secret-safe error envelopes, redacted logs, server-to-worker credentials distinct from evidence signing material, environment validation |
| Tenant data isolation | Cross-tenant identifier reuse or proxy abuse | Existing worker storage is filesystem-global and browser routes can proxy by ID | Tenant namespace in storage and every credential; no list-all; deny cross-tenant ID lookups and artifacts |
| Auditability | Logging failure, mutable file state, or a missing actor identity | Existing audit chain is useful but worker actions and approvals lack an authenticated actor model | Privacy-safe worker action/audit events, durable mode declaration, integrity verification, fail-closed behavior where audit logging is mandatory |

## Verified baseline findings

| Priority | Finding | Confirmed source evidence | Impact | Remediation disposition |
| --- | --- | --- | --- | --- |
| P0 | The worker accepts unauthenticated draft, review, publish, and download operations. | `docker/local/server.mjs`, request handler routes beginning at lines 93, 152, 164, 211, 237, 261, and 279. | A reachable worker has no authenticated tenant or operator boundary. | Address in worker authorization implementation. |
| P0 | Draft enumeration is global, and object access is ID/filesystem based. | `docker/local/server.mjs` lines 93–107 and 122–149. | Unpublished client data can be enumerated or changed if worker ingress is reachable. | Remove list-all and require tenant-scoped ownership for every object operation. |
| P0 | The browser upload experience sends report files directly to a browser-visible worker URL. | `web/frontend/src/app/upload/page.tsx` lines 20–22 and 99–165. | CORS cannot be treated as worker authentication; a browser can be directed at an unsafe endpoint. | Route privileged authoring through trusted server issuance/proxy, while retaining private self-hosted deployment. |
| P0 | Review approval is represented by editable client-provided strings. | `docker/local/server.mjs` lines 211–235. | A publication can falsely appear reviewed with no durable reviewer identity or proposal binding. | Persist authenticated review decision and bind it to canonical artifact digests. |
| P1 | Worker errors expose raw runtime details. | `docker/local/server.mjs` lines 204–208, 231–234, 254–258, and 299–302. | Internal file/process details can leak to a caller and complicate safe support handling. | Return stable generic error codes/messages; retain redacted correlation logs only. |
| P1 | File handling is bounded by size but not fully content-validated or capacity-bounded. | `docker/local/server.mjs` lines 164–208. | Crafted/oversized PDFs and repeated jobs can consume parser, CPU, disk, or artifact capacity. | Validate PDF header/structure and limits; impose job, disk, execution, and cleanup boundaries. |
| P1 | The documented architecture overstates planned managed controls relative to shipped code. | `docs/05-engineering/architecture.md` lines 12–16; `docs/05-engineering/deployment-runbook.md` lines 88–90. | Buyers and operators may infer RLS, queueing, object storage, or KMS protections that are not in the local worker. | Update release/operations documentation to label implemented, self-hosted, and planned controls exactly. |
| P1 | The old browser proxy is unauthenticated and forwards only a draft ID. | `web/frontend/src/app/api/local/drafts/[id]/route.ts` lines 5–40. | A public route may proxy worker data without a verified tenant/operator identity. | Protect or remove the proxy; relay only permitted calls with server-issued identity/capability context. |

## Required design invariants

The next implementation must satisfy the following invariants. Tests must prove both positive and negative behavior.

| Invariant | Acceptance test |
| --- | --- |
| Every authoring request has a verified actor, tenant, purpose, expiry, and opaque request identifier. | Missing, malformed, expired, wrong-purpose, replayed, and wrong-tenant capabilities all fail before object access or processing. |
| Worker storage objects cannot cross tenant boundaries. | Attempt to read, edit, review, publish, list, or download another tenant’s object using a known identifier; every attempt fails without revealing object existence or metadata. |
| A review cannot be forged by editing a placement file. | Changing `approvedBy`, `approvedAt`, manifest, source PDF, placement proposal, tenant, or digest after review causes publish refusal. |
| The caller receives no raw exception, filesystem path, command, secret, or parser detail. | Induce worker and parser failures; assert a stable generic error and a private correlation ID only. |
| PDFs are bounded before overlay work begins. | Reject non-PDF bytes, malformed files, page/stream overages, size overage, invalid filenames, and queue/capacity excess before a CLI process runs. |
| Processing is bounded and cleanable. | Assert maximum concurrent jobs, predictable overload behavior, timeout/kill behavior, artifact expiry, cleanup, and no successful artifact access after expiry. |
| Deployment keeps the worker private. | Compose exposes the web port as documented, binds the worker host port to loopback only, omits a PostgreSQL host port, and requires all security configuration. |
| Existing recipient evidence protections remain intact. | Full integration path preserves claim signing, expiry, revocation, mailbox proof, tenant download authorization, and privacy-safe audit records. |

## Release acceptance criteria

The release cannot be presented as a hardened self-hosted authoring system until the worker authorization, approval integrity, error-sanitization, and processing-boundary tests are green. The public RipoDoc hosted environment site may continue to fail closed for hosted account actions when durable PostgreSQL, email service, and challenge service configuration is absent. That configuration absence must remain visible only through safe operator diagnostics, never through secret-bearing or tenant-bearing public output.

## References

- [`docker/local/server.mjs`](../../docker/local/server.mjs)
- [`web/frontend/src/app/upload/page.tsx`](../../web/frontend/src/app/upload/page.tsx)
- [`web/frontend/src/app/api/local/drafts/[id]/route.ts`](../../web/frontend/src/app/api/local/drafts/[id]/route.ts)
- [`docs/05-engineering/architecture.md`](../05-engineering/architecture.md)
- [`docs/05-engineering/deployment-runbook.md`](../05-engineering/deployment-runbook.md)
- [`docs/05-security/self-hosted-deployment-and-read-only-audit.md`](self-hosted-deployment-and-read-only-audit.md)
