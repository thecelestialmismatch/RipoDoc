# RipoDoc Compliance Mapping: ISO 27001:2022 & SOC 2 Type II

**Release Baseline:** PR #9, merged commit `9a834ff`  
**Target Audience:** MSP compliance officers, security auditors, enterprise buyers, and board members  
**Author:** Manus AI  

## 1. Executive Overview

RipoDoc is engineered to meet stringent enterprise and MSP compliance standards. The PR #9 security overhaul introduced architectural hardening across identity management, tenant data isolation, worker authorization boundaries, audit logging integrity, and container security. 

This document maps RipoDoc’s implemented technical controls directly to **ISO/IEC 27001:2022** Annex A controls and **AICPA SOC 2 Type II** Trust Services Criteria (Security, Confidentiality, Processing Integrity, and Availability).

---

## 2. ISO/IEC 27001:2022 Control Mapping

| ISO 27001:2022 Control | Control Title | RipoDoc Implemented Implementation & Evidence |
| :--- | :--- | :--- |
| **A.5.15** | Access Control | Role-bound access control (`owner`, `admin`, `member`) enforced via server-side session checks in `web/frontend/src/lib/auth/server.ts`. Legacy shared-key admin access (`RIPODOC_ADMIN_ACCESS_KEY`) has been fully retired. |
| **A.5.17** | Authentication Information | Passwords derived using slow cryptographic key derivation (`scrypt` with salt and cost parameters in `web/frontend/src/lib/auth/primitives.ts`). Plaintext storage and MD5/SHA256 are strictly prohibited. |
| **A.8.2** | Privileged Access Rights | Privileged operations (tenant administration, evidence manifest uploads, and global posture inspection) require verified individual workspace sessions with tenant scope binding. |
| **A.8.9** | Configuration Management | Self-hosted Docker configuration (`docker-compose.selfhost.yml`) enforces read-only root filesystems, dropped capabilities (`cap_drop: [ALL]`), and non-root execution (`USER ripodoc`). |
| **A.8.12** | Data Leakage Prevention | Strict CSP headers, CSRF protection, SameSite cookies, and tenant-scoped query predicates (`listTenantReports()`) prevent cross-tenant data exposure. |
| **A.8.16** | Monitoring Activities | Hash-chained audit logging (`web/frontend/src/lib/audit/audit-log.ts`) records security-relevant events with tamper-evident chain verification tested in `audit.test.ts`. |
| **A.8.20** | Network Security | Private PDF authoring worker is bound to loopback or isolated internal networks, inaccessible directly from the browser; communication requires server-issued HMAC capabilities. |
| **A.8.24** | Use of Cryptography | HMAC-SHA-256 for evidence tokens, recipient challenge hashes, and capability signing; strict validation rejecting weak secrets (`tools/evidence-pdf/test/token.test.ts`). |
| **A.8.28** | Secure Coding | Strict TypeScript static analysis, ESLint validation, automated regression test suite (`npm run verify` passing 133 tests), and zero-vulnerability dependency audits. |

---

## 3. SOC 2 Type II Trust Services Criteria Mapping

| Trust Services Criteria | RipoDoc Control Implementation | Verification Evidence |
| :--- | :--- | :--- |
| **CC6.1 (Logical Access)** | Cloudflare Turnstile anti-automation checks, scrypt credential hashing, opaque session tokens, and server-managed `HttpOnly`, production `Secure`, and SameSite cookie controls. Turnstile is a CAPTCHA control, not multi-factor authentication. | `auth-primitives.test.ts`, `token.test.ts`, `middleware.ts` |
| **CC6.3 (Access Boundary)** | Tenant-scoped data isolation (`workspace_reports` queries bound to verified tenant ID); recipient-side mail verification (`/e/[token]/access`). | `workspace/reports.ts`, `recipient-proof.ts` |
| **CC6.6 (Boundary Protection)** | Web-to-worker proxy model. The browser never receives direct worker credentials. Worker requests require short-lived (90s), single-use HMAC capabilities. | `web/frontend/src/lib/authoring/worker.ts`, `docker/local/server.mjs` |
| **CC7.1 (Vulnerability Management)** | Production dependency scanning (`npm audit --omit=dev`), removal of previously identified high-severity advisories, pinned package resolutions, and reproducible CycloneDX SBOM generation. Final container-image scanning is a required deployment gate, documented separately. | Release audit logs, `container-sbom-and-vulnerability-scan.md` |
| **CC7.2 (System Monitoring)** | Safe public health endpoint (`/api/health`) exposing operational component status without disclosing secrets, customer data, or internal topologies. | `web/frontend/src/app/api/health/route.ts` |
| **PI1.1 (Processing Integrity)** | Immutable manifest approval checks. The PDF worker re-validates source PDF, manifest, and proposal digests prior to publication. | `docker/local/server.mjs`, `server.test.mjs` |
| **C1.2 (Confidentiality)** | Encryption in transit (TLS enforced via Vercel / reverse proxy); strict minimization of sensitive data in logs and error responses. | Middleware security headers, `email.ts` |

---

## 4. Compliance Boundary

This crosswalk describes implemented technical controls and the evidence available for the PR #9 release. It is **not** an ISO 27001 certification, a SOC 2 Type II report, or a substitute for an independent auditor’s testing of operating effectiveness over time.

## 5. Continuous Compliance & Audit Readiness

RipoDoc’s architecture supports continuous auditability through:
1. **Verifiable Test Artifacts**: 133 automated unit and integration tests executing on every commit.
2. **Tamper-Evident Logs**: Hash-chained event logging ensuring audit logs cannot be altered without detection.
3. **Fail-Closed Design**: All security-sensitive paths default to denial when configuration or session verification fails.
