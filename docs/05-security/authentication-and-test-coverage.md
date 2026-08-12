# Authentication Architecture and Test Coverage

**Maintainer:** Manus AI
**Release baseline:** Worker-hardening release branch based on PR #8, merged commit `f316e1e`
**Validation command:** `npm run verify`

## Authentication architecture

RipoDoc’s workspace identity boundary is implemented in **TypeScript** on the **Next.js 16 App Router** server runtime. The design intentionally keeps password verification, session minting, one-time code handling, rate limits, and email delivery out of browser code. Node.js `crypto` supplies `scrypt`, `randomBytes`, HMAC-SHA-256, and constant-time equality; PostgreSQL is the durable source of truth; and `pg` uses parameterized queries and explicit transactions for state transitions.[1] [2]

| Component | Responsibility | Principal source |
| --- | --- | --- |
| Next.js App Router and middleware | Provides server routes, request-bound cookies, redirects, CSRF cookie issuance, and global browser security headers. | [`web/frontend/src/app/api/auth/[action]/route.ts`](../../web/frontend/src/app/api/auth/[action]/route.ts), [`web/frontend/src/middleware.ts`](../../web/frontend/src/middleware.ts) |
| Node.js `crypto` | Implements memory-hard scrypt password derivation, 32-byte random opaque values, HMAC hashing for stored secrets, and timing-safe comparison. | [`web/frontend/src/lib/auth/primitives.ts`](../../web/frontend/src/lib/auth/primitives.ts) |
| PostgreSQL through `pg` | Stores tenant users, password hashes, sessions, one-time codes, rate-limit buckets, audit events, and tenant report records. Parameterized statements prevent value interpolation in SQL. | [`web/frontend/src/lib/auth/database.ts`](../../web/frontend/src/lib/auth/database.ts), [`migrations/008_create_auth_and_workspace.sql`](../../migrations/008_create_auth_and_workspace.sql) |
| Resend HTTPS API | Delivers verification, password-reset, and recipient-proof codes; raw codes remain in the email body and are never persisted or placed in URLs. | [`web/frontend/src/lib/auth/email.ts`](../../web/frontend/src/lib/auth/email.ts) |
| Cloudflare Turnstile | Performs server-side production anti-automation verification before auth actions are processed. | [`web/frontend/src/lib/auth/captcha.ts`](../../web/frontend/src/lib/auth/captcha.ts) |

The implementation closes the five high-priority authentication controls in the accompanying request. Signup and recovery are enumeration-resistant: they use one generic response and a response-time floor; login verifies a fixed dummy scrypt hash when the account lookup fails. Rate limits are persisted by both privacy-hashed address and privacy-hashed IP, and Turnstile is mandatory in production. Email verification is required before a user can receive a valid session. Passwords never leave the scrypt representation. Verification, reset, and recipient-proof codes are 32-byte random values, stored only as keyed HMACs, consumed atomically, and expire after 30 minutes.[1] [2]

> **Fail-closed hosting rule.** The hosted workspace does not accept durable account actions until PostgreSQL, the application origin, a 32-character authentication secret, Resend credentials, sender identity, and production Turnstile configuration are supplied. This avoids an insecure fallback to ephemeral filesystem state or unactioned email delivery.[2]

## Automated verification results

The repository uses Node’s built-in test runner. Its production test command executes all 15 first-party test files, including a real local-worker integration test. The latest run completed **135 tests**, with **135 passed**, **0 failed**, **0 skipped**, and **0 todo**. The complete release gate adds strict TypeScript checking and the Next.js production build through `npm run verify`.[3]

| Security coverage area | Tests | What this proves |
| --- | ---: | --- |
| Authentication, workspace runtime, protected dashboard/download workflow, and role-bound operator posture | 7 | Scrypt and opaque-token primitives work; protected runtime posture avoids secret exposure; the retired deployment-wide admin key is not surfaced; the dashboard remains backed by a verified tenant query; and the download route documents server-only worker configuration. |
| Evidence authorization and expiry | 16 | Evidence claims are signed, recipient-hash-bound, expiry-checked, revocable, report-scoped, and recipient-safe on denial. |
| Manifest and fixture validation | 16 | Published input is structurally validated, unsafe or duplicate element IDs are rejected, approvals are mandatory, and malformed report fields cannot reach rendering. |
| Hash-chained audit trail | 11 | Audit history detects tampering, protects recipient identity, remains verifiable across reopen/append operations, and records access outcomes. |
| Reviewed overlay publication workflow | 57 | Exact-PDF binding, review approvals, element mapping, placement bounds, proposal parsing, link generation, and readback are enforced. |
| PDF construction and safe delivery | 27 | PDF serialization escapes untrusted values; external URLs must be HTTPS; unsafe rectangles and JavaScript are refused; evidence rows remain out of final PDFs. |
| Private worker authorization and publication boundary | 1 | The worker rejects direct browser and unsigned requests, validates a server-issued tenant/scope/draft capability, prevents cross-tenant proposal access, records the server reviewer rather than trusting browser approval strings, rejects wrong-purpose publish attempts, validates PDF bytes, and yields only the digest-checked approved PDF artifact. |
| **Total** | **135** | Complete shipped regression suite. |

## File-by-file test inventory

| Test file | Tests | Security and product coverage |
| --- | ---: | --- |
| `tools/evidence-pdf/test/auth-primitives.test.ts` | 2 | Scrypt derivation/verification and random token or privacy-hash behavior. |
| `tools/evidence-pdf/test/application-runtime.test.ts` | 5 | Valid manifest discovery, secret-safe security posture, regression protection against exposing the retired deployment-wide admin key, server-only self-hosted download guidance, and dashboard tenant-query contract coverage. |
| `tools/evidence-pdf/test/audit.test.ts` | 11 | Hash chaining, tamper detection, concurrent appends, restart behavior, structured sink, and no raw recipient email in audit records. |
| `tools/evidence-pdf/test/demo-fixture.test.ts` | 3 | Shipped fixture validity and production-ready evidence source structure. |
| `tools/evidence-pdf/test/link-expiry.test.ts` | 4 | Time-bound claim expiry, control behavior, and denial semantics. |
| `tools/evidence-pdf/test/manifest.test.ts` | 13 | Schema validation, approvals, IDs, timestamps, recipients, reports, rows, and charts. |
| `tools/evidence-pdf/test/overlay-locate.test.ts` | 11 | Deterministic placement discovery and bounded candidate zones. |
| `tools/evidence-pdf/test/overlay-plan.test.ts` | 8 | Approval gates, unknown/missing placements, page bounds, exact-PDF binding, round trips, and malformed plan rejection. |
| `tools/evidence-pdf/test/overlay-reader.test.ts` | 18 | Reading generated overlays without expanding the authorized link surface. |
| `tools/evidence-pdf/test/overlay-sample.test.ts` | 6 | Sample overlay generation and reviewed source-report fidelity. |
| `tools/evidence-pdf/test/overlay-writer.test.ts` | 14 | Safe annotation writing, coordinates, links, and document integrity. |
| `tools/evidence-pdf/test/pdf.test.ts` | 18 | PDF escaping, link annotations, HTTPS requirement, zero-area refusal, loopback restriction, deterministic output, and xref integrity. |
| `tools/evidence-pdf/test/report.test.ts` | 9 | Complete report links, on-page geometry, zero embedded evidence rows, no JavaScript, secure origin enforcement, and URL encoding. |
| `tools/evidence-pdf/test/token.test.ts` | 12 | HMAC claim integrity, recipient privacy binding, wrong-secret/tamper refusal, revocation, report scope, malformed tokens, and recipient-safe errors. |
| `docker/local/server.test.mjs` | 1 | End-to-end private-worker flow covering direct-browser rejection, missing authorization, invalid PDF rejection, tenant isolation, capability scope enforcement, server-bound review attribution, safe failures, publication, and PDF download. |

## Running the release gate

```bash
npm run typecheck
npm test
npm run lint
npm run build:web
npm run verify
```

The canonical `verify` command runs `typecheck`, then the 135-test suite, then the production frontend build. It should be the minimum pre-merge gate for any change that affects authorization, user identity, evidence claims, manifests, audit behavior, PDF rendering, worker ingress, private operations access, or the protected dashboard/download workflow.[3]

## References

[1]: ../../web/frontend/src/lib/auth/service.ts "RipoDoc authentication service"
[2]: ../../web/frontend/src/lib/auth/primitives.ts "RipoDoc cryptographic authentication primitives"
[3]: ../../package.json "RipoDoc release verification scripts"
