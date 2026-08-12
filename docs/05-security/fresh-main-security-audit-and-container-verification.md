# Fresh Main-Branch Security Audit and Container Verification

**Audit date:** 12 August 2026 (GMT+10)  
**Starting main baseline:** `7be51dbdc6cde62ba9e79290f5077c13fad4cc21` (PR #10 merge)  
**Audit scope:** Application release checks, production dependency audits, final-image builds, runtime smoke tests, SBOMs, and high/critical vulnerability scanning.

## 1. Executive Result

The latest `main` branch passed the application release gate: **133 tests passed, 0 failed**, strict TypeScript and the production build passed, ESLint passed, and both root and frontend `npm audit --omit=dev` results reported **0 known production vulnerabilities**.

The final-image audit also exposed two self-hosted web Dockerfile path defects that prevented a successful runtime-image build. Both defects were remediated in the candidate release represented by this report. The resulting web and worker images built successfully, started successfully in smoke tests, generated CycloneDX SBOMs, and returned **0 critical and 0 high findings** in a Trivy 0.73.0 scan with current vulnerability data.

> **Release status.** The container digests in this report are candidate digests produced from the audited remediation before its merge. They are not remote registry digests. Rebuild and re-scan from the merged commit in CI before publishing a customer-facing image tag.

## 2. Application Security Audit

| Check | Command / Evidence | Result |
| --- | --- | --- |
| Regression suite | `npm run verify` | 133 passed; 0 failed; 0 skipped |
| Static analysis | `npm run lint` | Passed |
| Root production dependencies | `npm audit --omit=dev` | 0 known vulnerabilities |
| Frontend production dependencies | `npm --prefix web/frontend audit --omit=dev` | 0 known vulnerabilities |
| Tracked secret files | Git tracked-file check for `.env`, `.pem`, and `.key` paths | None found |
| Production build | Next.js 16.3.0 build | Passed; upstream middleware-convention deprecation notice remains informational and tracked |

## 3. Container Build Findings and Remediation

| Finding | Impact | Remediation | Verification |
| --- | --- | --- | --- |
| Runtime Dockerfile copied `/app/node_modules`, which does not exist because dependencies are installed under `/app/web/frontend`. | The web self-hosted image could not build. | Removed the invalid copy instruction. | Corrected web image built successfully. |
| Runtime Dockerfile copied `/app/content`, but report manifests live under `/app/web/frontend/content`. | The web self-hosted image could not build. | Copied the manifest directory to `/app/content`, matching the Compose `RIPODOC_CONTENT_ROOT=/app/content/reports`. | Corrected web image built successfully. |
| Bundled npm CLI payload in Node base image introduced high and critical scanner findings not required by the running application. | Unnecessary vulnerable dependency surface in web and worker runtime images. | Production frontend dependencies are pruned after build; both final images remove the unused npm/npx CLI tree and invoke Node directly. | Rebuilt images scanned at 0 high/critical findings. |

## 4. Verified Base and Candidate Image Digests

| Image | Role | Immutable Digest |
| --- | --- | --- |
| `node:22-bookworm-slim` | Web build and runtime base | `sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436` |
| `node:22-alpine` | Private worker runtime base | `sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32` |
| `postgres:16-alpine` | Declared self-hosted database image | `sha256:57c72fd2a128e416c7fcc499958864df5301e940bca0a56f58fddf30ffc07777` |
| `ripodoc-web:container-remediation` | Candidate remediated web image | `sha256:786f9cbedbbe16b3a007ddaf39643c1af6e4782437b438d4854058a3cf624b6e` |
| `ripodoc-worker:container-remediation` | Candidate remediated private worker image | `sha256:329ec08fb65185404cb24f0e9f1e5f1c497314d00414b2ea50ba2b20b0e92d99` |

## 5. Final-Image Vulnerability Scan

**Scanner:** Trivy 0.73.0, vulnerability scanner enabled, current database downloaded at scan time.  
**Policy:** HIGH and CRITICAL severities; unfixed findings ignored for the release gate.

| Image | Critical | High | Result |
| --- | ---: | ---: | --- |
| `ripodoc-web:container-remediation` | 0 | 0 | Passed |
| `ripodoc-worker:container-remediation` | 0 | 0 | Passed |

The initial pre-remediation final images had one critical and seven high findings. All were in the bundled npm CLI payload inherited from the Node runtime image, even though neither production container invokes npm at runtime. Removing that unused runtime payload reduced the scanner findings to zero without removing the Node runtime or application dependencies required for service operation.

## 6. Final-Image SBOM Inventory

| SBOM | Format | Component Count | Scope |
| --- | --- | ---: | --- |
| `sbom/ripodoc-web-container-remediation.cdx.json` | CycloneDX 1.7 JSON | 252 | Final web runtime image, including OS and application inventory |
| `sbom/ripodoc-worker-container-remediation.cdx.json` | CycloneDX 1.7 JSON | 30 | Final private worker runtime image, including OS and application inventory |

## 7. Runtime Smoke Tests

The sandbox cannot create normal Docker bridge-network iptables rules; this is an infrastructure constraint, not a RipoDoc runtime failure. Both images were therefore started under Docker host networking for an isolated smoke test.

| Image | Test | Result |
| --- | --- | --- |
| Web | Started with direct Next.js command at port 3100; `GET /api/health` returned the safe fail-closed status response. | Passed |
| Worker | Started with non-production secrets and loopback bind at port 4100; `GET /api/local/health` returned `{"status":"ok","service":"ripodoc-private-worker"}`. | Passed |

## 8. Executive Script and Speaker Notes Review

The PR #9 executive script was reviewed against this audit and corrected for evidence accuracy.

| Review Topic | Result |
| --- | --- |
| Test terminology | Uses **133 automated test cases**, not “133 test suites.” |
| Build status | States that the production build passed while disclosing the Next.js middleware-convention deprecation notice. |
| Container claims | States non-root, read-only, capability-drop, and bounded-resource controls without claiming unsupported automatic recovery. |
| Compliance posture | Describes ISO 27001/SOC 2 as an implementation crosswalk, not a certification or Type II opinion. |
| Readiness statement | Conditions self-hosted readiness on operator-controlled environment, TLS, backup, and final-image scan prerequisites. |

## 9. Mandatory Release Gate for the Remediation

Before a self-hosted customer receives a tag built from the remediation, CI must rebuild both images from the merged commit, record their registry digests, generate both CycloneDX image SBOMs, and run Trivy or an equivalent scanner against HIGH and CRITICAL severities. The release must fail if either image has unreviewed high or critical findings.
