# Authentication Architecture and Test Coverage

**Maintainer:** Manus AI

**Release baseline:** Main branch after PR #36, plus locally verified CSP and dependency remediation pending this release

**Validation command:** `npm run verify`

## Authentication architecture

RipoDoc’s workspace identity boundary is implemented in **TypeScript** on the **Next.js 16 App Router** server runtime. Password verification, session minting, one-time code handling, rate limits, and email delivery stay outside browser code. Node.js `crypto` supplies `scrypt`, `randomBytes`, HMAC-SHA-256, and constant-time equality; PostgreSQL is the durable source of truth; and `pg` uses parameterized queries and explicit transactions for state transitions.[1] [2]

| Component | Responsibility | Principal source |
| --- | --- | --- |
| Next.js App Router and request proxy | Provides server routes, request-bound cookies, redirects, CSRF cookie issuance, and global browser security headers. | [`web/frontend/src/app/api/auth/[action]/route.ts`](../../web/frontend/src/app/api/auth/[action]/route.ts), [`web/frontend/src/proxy.ts`](../../web/frontend/src/proxy.ts) |
| Node.js `crypto` | Implements memory-hard scrypt password derivation, 32-byte random opaque values, HMAC hashing for stored secrets, and timing-safe comparison. | [`web/frontend/src/lib/auth/primitives.ts`](../../web/frontend/src/lib/auth/primitives.ts) |
| PostgreSQL through `pg` | Stores tenant users, password hashes, sessions, one-time codes, rate-limit buckets, audit events, tenant report records, and CRM-sync outbox state. Parameterized statements prevent value interpolation in SQL. | [`web/frontend/src/lib/auth/database.ts`](../../web/frontend/src/lib/auth/database.ts), [`migrations/008_create_auth_and_workspace.sql`](../../migrations/008_create_auth_and_workspace.sql), [`migrations/010_create_founding_partner_crm_sync.sql`](../../migrations/010_create_founding_partner_crm_sync.sql) |
| email service HTTPS API | Delivers verification, password-reset, and recipient-proof codes; raw codes remain in the email body and are never persisted or placed in URLs. | [`web/frontend/src/lib/auth/email.ts`](../../web/frontend/src/lib/auth/email.ts) |
| Cloudflare challenge service | Performs server-side production anti-automation verification before auth actions are processed. | [`web/frontend/src/lib/auth/captcha.ts`](../../web/frontend/src/lib/auth/captcha.ts) |

Signup and recovery are enumeration-resistant: they use one generic response and a response-time floor; login verifies a fixed dummy scrypt hash when account lookup fails. Rate limits are persisted by both privacy-hashed address and privacy-hashed IP, and challenge service is mandatory in production. Email verification is required before a user can receive a valid session. Passwords never leave the scrypt representation. Verification, reset, and recipient-proof codes are 32-byte random values, stored only as keyed HMACs, consumed atomically, and expire after 30 minutes.[1] [2]

> **Fail-closed hosting rule.** The hosted workspace does not accept durable account actions until PostgreSQL, the application origin, a 32-character authentication secret, email service credentials, sender identity, and production challenge service configuration are supplied. This avoids an insecure fallback to ephemeral filesystem state or unactioned email delivery.[2]

## Automated verification results

The repository uses Node’s built-in test runner. The fresh release gate completed **171 tests**, with **171 passed**, **0 failed**, **0 skipped**, **0 cancelled**, and **0 pending test markers**. The complete release gate adds strict TypeScript checking and the Next.js production build through `npm run verify`.[3]

| Coverage area | What the current regression suite proves |
| --- | --- |
| Authentication and workspace runtime | Scrypt and opaque-token primitives work; protected runtime posture avoids secret exposure; the retired deployment-wide admin key is not surfaced; tenant query and encrypted-contact contracts remain covered. |
| Evidence authorization and expiry | Evidence claims are signed, recipient-hash-bound, expiry-checked, revocable, report-scoped, and recipient-safe on denial. |
| Manifest, source, and operations assessment | Published input is structurally validated, unsafe or duplicate element IDs are rejected, approvals are mandatory, and proof-operations readiness is derived from manifest facts. |
| Hash-chained audit trail | Audit history detects tampering, protects recipient identity, remains verifiable across reopen/append operations, and records access outcomes. |
| Reviewed overlay publication workflow | Exact-PDF binding, review approvals, element mapping, placement bounds, proposal parsing, link generation, and readback are enforced. |
| PDF construction and safe delivery | PDF serialization escapes untrusted values; external URLs must be HTTPS; unsafe rectangles and JavaScript are refused; evidence rows remain out of final PDFs. |
| Private worker authorization | The worker rejects direct browser and unsigned requests, validates a server-issued tenant/scope/draft capability, prevents cross-tenant proposal access, records the server reviewer, validates PDF bytes, and yields only a digest-checked approved artifact. |
| RipoDoc CRM consent boundary and protocol | CRM payloads exclude evidence data; loopback/private targets are blocked; HMAC authorization and least-data mapping are covered; a local mock server exercises lookup/create/update, remote rejection, timeout classification, and non-blocking outbox outcomes. |
| Discovery and telemetry safety | IndexNow payload validation and privacy-preserving Web Vitals request validation are covered. |

## File-by-file test inventory

The current release command executes **19 TypeScript test files** plus **one private-worker Node integration test file**. Test count is reported from the executed release gate rather than manually summed from this inventory, because individual test files can evolve independently.

| Test file | Security and product coverage |
| --- | --- |
| `application-runtime.test.ts` | Valid manifest discovery, secret-safe posture, retired admin-key regression protection, self-hosted guidance, dashboard tenant-query contract, founding-partner intake, durable audit schema, preflight dependencies, and encrypted-contact round trip. |
| `audit.test.ts` | Hash chaining, tamper detection, concurrent appends, restart behavior, structured sink, and no raw recipient email in audit records. |
| `auth-primitives.test.ts` | Scrypt derivation/verification and random token or privacy-hash behavior. |
| `demo-fixture.test.ts` | Shipped fixture validity and evidence source structure. |
| `crm-mock-integration.test.ts` | Local HTTP mock-server coverage of HMAC authorization, lookup/create/update, rejection retry, timeout, and unclaimed outbox behavior. |
| `crm.test.ts` | CRM address blocking, HMAC authorization shape, and least-data payload mapping. |
| `indexnow.test.ts` | Discovery payload validation and safe submission contract. |
| `link-expiry.test.ts` | Time-bound claim expiry, control behavior, and denial semantics. |
| `manifest.test.ts` | Schema validation, approvals, IDs, timestamps, recipients, reports, rows, and charts. |
| `operations.test.ts` | Manifest-derived proof-operations assessment and bounded readiness findings. |
| `overlay-locate.test.ts` | Deterministic placement discovery and bounded candidate zones. |
| `overlay-plan.test.ts` | Approval gates, unknown/missing placements, page bounds, exact-PDF binding, round trips, and malformed-plan rejection. |
| `overlay-reader.test.ts` | Reading generated overlays without expanding the authorized link surface. |
| `overlay-sample.test.ts` | Sample overlay generation and reviewed source-report fidelity. |
| `overlay-writer.test.ts` | Safe annotation writing, coordinates, links, and document integrity. |
| `pdf.test.ts` | PDF escaping, link annotations, HTTPS requirement, zero-area refusal, loopback restriction, deterministic output, and xref integrity. |
| `report.test.ts` | Complete report links, on-page geometry, zero embedded evidence rows, no JavaScript, secure origin enforcement, and URL encoding. |
| `token.test.ts` | HMAC claim integrity, recipient privacy binding, wrong-secret/tamper refusal, revocation, report scope, malformed tokens, and recipient-safe errors. |
| `web-vitals.test.ts` | Anonymous Web Vitals request validation and field bounds. |
| `docker/local/server.test.mjs` | End-to-end private-worker flow covering direct-browser rejection, missing authorization, invalid PDF rejection, tenant isolation, capability scope enforcement, server-bound review attribution, safe failures, publication, and PDF download. |

## Running the release gate

```bash
npm run typecheck
npm test
npm run lint
npm run build:web
npm run verify
```

The canonical `verify` command runs strict type checking, the **169-test** suite, and the production frontend build. It is the minimum pre-merge gate for a change that affects authorization, identity, evidence claims, manifests, audit behavior, PDF rendering, worker ingress, private operations, CRM boundaries, telemetry, or protected dashboard/download workflows.[3]

> **Scope limit.** Passing tests prove the checked contract. They do not establish that the public hosted environment has all production configuration, that a real customer has completed the workflow, that a real RipoDoc CRM tenant has been configured, or that an independent security assessment has occurred.

## References

[1]: ../../web/frontend/src/lib/auth/service.ts "RipoDoc authentication service"
[2]: ../../web/frontend/src/lib/auth/primitives.ts "RipoDoc cryptographic authentication primitives"
[3]: ../../package.json "RipoDoc release verification scripts"
