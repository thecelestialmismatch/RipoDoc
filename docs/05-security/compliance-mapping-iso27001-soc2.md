# RipoDoc Technical Control Mapping: ISO/IEC 27001:2022 and SOC 2 Criteria

**Release baseline:** Main branch after PR #36, plus locally verified CSP and dependency remediation pending this release

**Target audience:** MSP security reviewers, prospective enterprise buyers, and engineering maintainers

**Author:** Manus AI

## Executive boundary

This document is a **technical control crosswalk**, not a compliance certificate. It identifies implemented design controls that may support a future ISO/IEC 27001 or SOC 2 programme. It does not establish that RipoDoc is certified, compliant, audited, or operating effectively over time. In particular, the currently hosted workspace is intentionally fail-closed until its durable production services are configured.

## ISO/IEC 27001:2022 control-support mapping

| ISO control | Control title | Implemented technical support | Important boundary |
| --- | --- | --- | --- |
| **A.5.15** | Access control | Server-side session checks and tenant-scoped role enforcement for `owner`, `admin`, `author`, and `viewer`; retired shared deployment-wide admin key is regression-tested not to reappear. | Requires configured production identity, database, and operational access reviews. |
| **A.5.17** | Authentication information | Passwords use scrypt with salt/cost parameters; plaintext and weak direct hashes are not used. Opaque session, verification, reset, and recipient-proof values are random and stored as keyed HMACs. | Does not replace an identity policy, MFA decision, credential lifecycle policy, or access review. |
| **A.8.2** | Privileged access rights | Tenant administration, evidence-manifest work, and protected operations require verified individual workspace sessions with tenant scope binding. | Needs production role-assignment procedures and evidence of periodic review. |
| **A.8.9** | Configuration management | Self-hosted Docker configuration applies non-root execution, dropped capabilities, and read-only filesystem posture where documented. | Operators remain responsible for image, host, secret, backup, and patch management. |
| **A.8.12** | Data leakage prevention | CSP, CSRF, SameSite cookies, server-side tenant predicates, recipient-bound evidence tokens, and evidence-row exclusion from final PDFs reduce exposure paths. | Browser controls do not prevent screenshots or all downstream copying; tenancy must be configured and exercised in production. |
| **A.8.16** | Monitoring activities | Hash-chained audit events record evidence-access outcomes. Hosted deployments can use a transactional PostgreSQL chain; self-hosted operators can retain a persisted file chain. | A full monitoring programme still requires alerting, retention, review cadence, and incident response. |
| **A.8.20** | Network security | Private PDF authoring worker is designed for loopback or isolated internal networks; browser requests lack direct worker credentials and require server-issued HMAC capabilities. | Network segmentation and ingress rules must be implemented by each deployed environment. |
| **A.8.24** | Use of cryptography | HMAC-SHA-256 signs evidence tokens, recipient challenge hashes, and worker capabilities; tests reject weak secrets and malformed claims. | This is a design control, not a cryptographic key-management programme. |
| **A.8.28** | Secure coding | Strict TypeScript, **169 passing automated tests**, production build gate, dependency-audit remediation, and production-only CSP hardening support secure development. | Test passage does not replace independent review, code-review evidence, threat modelling, or penetration testing. |

## SOC 2 Trust Services Criteria support mapping

| Criteria | Technical support | Verification evidence | Important boundary |
| --- | --- | --- | --- |
| **CC6.1 — Logical access** | challenge service production anti-automation checks, scrypt credential hashing, opaque sessions, and server-managed `HttpOnly`, production `Secure`, and SameSite cookies. | `auth-primitives.test.ts`, `token.test.ts`, authentication routes, request proxy. | challenge service is not multi-factor authentication; deployed configuration is required. |
| **CC6.3 — Access boundary** | Tenant-scoped report queries and recipient-side proof flow protect report/evidence access. | Workspace-report, recipient-proof, and application-runtime coverage. | Requires production database and end-to-end tenant testing. |
| **CC6.6 — Boundary protection** | Browser-to-worker proxy model; short-lived, single-use HMAC capability requests; no direct browser worker credential. | `docker/local/server.test.mjs`, authoring-worker sources. | Requires actual private deployment topology and network enforcement. |
| **CC7.1 — Vulnerability management** | Production dependency audit, supported lockfile remediation for the identified `nanoid` advisory, and reproducible build gates. | Fresh frontend production dependency audit reported zero findings after remediation. | A point-in-time advisory result is not complete supply-chain or container assurance. |
| **CC7.2 — System monitoring** | Safe public health route provides bounded component status without customer data or secrets. | `web/frontend/src/app/api/health/route.ts`. | A health route is not a monitoring, alerting, or incident-management programme. |
| **PI1.1 — Processing integrity** | Manifest approval and digest checks; worker revalidates source PDF, manifest, and proposal prior to publication. | Overlay and private-worker test coverage. | Requires production evidence of operating effectiveness. |
| **C1.2 — Confidentiality** | TLS termination through hosting/reverse-proxy posture, minimised sensitive values in logs/errors, and evidence/CRM data boundary. | Security headers, email handling, CRM tests and operator guide. | Operators must configure infrastructure, retention, backups, and vendor agreements. |

## Verification baseline

The release gate consists of strict type checking, the Node test suite, and the optimized frontend build. The fresh observed result was **169 passed, 0 failed, 0 skipped, 0 cancelled, and 0 pending test markers**. The suite includes the private-worker integration flow and mock-server coverage for consent-gated RipoDoc CRM lookup/create/update, rejection, timeout, and outbox behavior.

> **Critical limitation.** The current test result verifies the checked code contract. It does not prove that a real hosted customer workflow, a real RipoDoc CRM tenant, a configured production identity system, backup/restore, alerting, or an independent auditor’s operating-effectiveness test has occurred.

## Use of this document

Use this document to identify technical evidence for a future control programme and to decide which operating controls remain to be built. Do not provide it as a certification statement, a SOC 2 report, an ISO certificate, a legal warranty, or a substitute for qualified counsel and independent audit work.
