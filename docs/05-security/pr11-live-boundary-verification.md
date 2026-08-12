# RipoDoc PR #11 Authorized Live Boundary Verification

**Verified deployment:** `https://www.ripodoc.com`  
**Production baseline:** PR #11 merge commit `8ad40eb48c5d4906ea25bff6efbcf01a02ade4d5`  
**Test date:** 12 August 2026 (GMT+10)  
**Scope:** Non-destructive, owner-authorized verification of public request rejection, retired worker ingress, and signed evidence-claim failure behavior.

## 1. Scope and Safety Boundary

This exercise used only RipoDoc’s own public deployment and deliberately avoided credential guessing, tenant enumeration, high-volume traffic, payload mutation beyond malformed input, email challenge delivery, or actions that could create, change, delete, or publish customer data. It is a focused boundary verification, not a substitute for an independent full-scope penetration test.

> RipoDoc evidence links are **not JWTs**. They are canonical payloads signed with HMAC-SHA-256 and contain a per-link revocation identifier (`jti`). The same security objective—tamper detection, expiry, and selective revocation—exists, but the implementation should not be represented as JWT-based.

## 2. Live Boundary Probes

| Probe | Safe request | Observed response | Verification result |
| --- | --- | --- | --- |
| Anonymous authoring request | `POST /api/authoring/propose` with `{}` and no session | `401`; `{"error":"A verified workspace session is required."}` | Passed: no unauthenticated path to the private worker. |
| Retired direct draft relay | `GET /api/local/drafts/not-a-real-draft` | `410`; explanatory non-sensitive error | Passed: the obsolete public draft relay is retired and cannot proxy arbitrary draft IDs. |
| Malformed signed evidence claim | `GET /e/not-a-signed-evidence-claim` | `307` to the recipient-proof route; no evidence data returned | Passed: a claim alone does not render evidence directly; the request enters the proof gate. |
| Anonymous manifest access | `GET /api/reports/not-a-valid-report` | `404`; `{"error":"Not found"}` | Passed: no report or tenant existence details were exposed to an unauthenticated caller. |

All observed responses applied `Cache-Control: no-store`, a restrictive Content Security Policy, `Referrer-Policy: no-referrer`, `Strict-Transport-Security`, `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`, and a strict same-site CSRF cookie. No response contained secrets, report content, recipients, tenants, sessions, worker credentials, or stack traces.

## 3. Worker Isolation Result

The production public deployment does not expose the self-hosted worker service. The browser-facing authoring route required a verified workspace session before it could reach the server-side capability issuer. The prior browser-reachable draft relay explicitly returned `410 Gone`. This confirms the externally observable side of the worker-isolation design: the browser cannot turn an arbitrary draft identifier into a direct worker request.

The internal worker authorization contract is separately exercised in `docker/local/server.test.mjs`, including unsigned, wrong-purpose, cross-tenant, expired, replayed, invalid-upload, and altered-approval rejection cases. That test runs against the self-hosted worker contract; it does not require production worker credentials or a customer report.

## 4. Signed Claim and Revocation Result

`web/frontend/src/lib/evidence/token.ts` uses HMAC-SHA-256 over a canonical base64url payload and verifies signatures with a constant-time comparison. The claims include report ID, version, recipient hash, expiry, and JTI. The verifier rejects malformed claims, a bad signature, wrong report binding, expiry, and a JTI included in the revocation set.

The live deployment cannot safely perform a positive revocation test without a production-signed test claim and access to the deployment’s revocation configuration. Minting or configuring either would require secrets and could change production state, so it was intentionally excluded from this non-destructive exercise. The deterministic test `a revoked token id is rejected even before expiry` in `tools/evidence-pdf/test/token.test.ts` verifies the exact revocation branch with a signed test claim and revoked JTI; the full current release gate passes 133 tests.

## 5. Conclusion and Required Ongoing Controls

The authorized external probes passed. The public service fails closed for anonymous authoring, does not retain a direct draft proxy, does not disclose report existence, and does not render evidence from a malformed claim. The HMAC/JTI revocation mechanism has focused automated coverage; a production positive revocation exercise should be performed only in a dedicated staging tenant with a test recipient, a narrowly scoped signed test link, and an approved change window.

For each self-hosted release, operators should retain the image digests, final-image SBOMs, high/critical scanner output, worker integration-test output, evidence-token test output, and a signed operational change record.
