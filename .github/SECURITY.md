# RipoDoc Security Policy

## Supported security posture

RipoDoc is actively developed on the `main` branch. Security fixes are made against the current supported codebase; older commits, forks, custom images, and locally modified deployments may require an operator-specific update plan.

The public hosted site is an evaluation and documentation surface. Hosted account and intake operations are intentionally fail-closed unless their durable configuration and release gate are complete. Self-hosted operators remain responsible for their own infrastructure, secrets, network boundary, email provider, backups, update process, and monitoring.

## Reporting a vulnerability

Please **do not** report a vulnerability through a public repository platform issue, discussion, pull request, social-media post, or public chat.

Use repository platform’s private vulnerability-reporting flow for this repository:

1. Open the repository’s **Security** tab.
2. Select **Report a vulnerability**.
3. Provide a minimal, reproducible description and wait for maintainer acknowledgement.

If private reporting is unavailable in the repository interface, contact the repository owner privately through their [repository platform profile](https://github.com/thecelestialmismatch) and include `RipoDoc security report` in the subject or first line. Do not send active credentials, production report PDFs, recipient information, one-time codes, signed evidence links, database exports, or other customer data.

## What to include

A high-quality report helps maintainers verify and resolve an issue quickly. Include:

- A concise description of the security impact.
- Affected version, commit, route, component, or configuration boundary.
- Safe, minimal reproduction steps using synthetic or redacted data only.
- Expected versus actual behavior.
- Relevant logs or screenshots with secrets, identifiers, tokens, URLs, personal information, and customer data removed.
- Suggested mitigation or fix, if you have one.

## Scope guidance

Reports are especially valuable when they involve:

| Area | Examples |
| --- | --- |
| Evidence authorization | Signature bypass, recipient-binding failure, expiry/revocation failure, claim confusion, or excessive evidence response. |
| Authentication | Account enumeration, session fixation, CSRF bypass, reset or verification-code misuse, rate-limit bypass, or weak secret handling. |
| Tenant isolation | Cross-tenant report, draft, audit, artifact, or administrative access. |
| Private worker boundary | Browser-direct access, capability replay, wrong-purpose capability use, worker credential exposure, or cross-tenant authoring. |
| Supply chain and deployment | Exposed secrets, dangerous container defaults, an exploitable dependency, configuration that defeats a documented fail-closed gate, or unsafe default network exposure. |
| Healthcare Mode B | A path that accepts PHI/ePHI publicly, enables a forbidden webhook, or makes an unsupported healthcare compliance claim. |

Out-of-scope reports may include purely theoretical findings without a plausible impact, dependencies with no reachable code path, social engineering, denial-of-service testing against third-party infrastructure, and vulnerabilities in an operator’s altered deployment that cannot be reproduced against RipoDoc’s current source. These examples do not limit good-faith reports; explain the context and the maintainers will assess it.

## Safe research expectations

Please act in good faith. Do not access, alter, exfiltrate, or destroy data that is not yours. Do not use high-volume scanning, load tests, automated exploitation, or social engineering against the public site or any operator deployment. Do not submit real customer data through forms or upload paths. Stop testing if you encounter another user’s data, a live credential, or an unexpected operational side effect.

## Disclosure and remediation

Maintainers will assess a report, request clarification if needed, develop a fix or mitigation, and coordinate disclosure when appropriate. RipoDoc does not publish a fixed response or remediation timeline because the severity, reproducibility, operator impact, and release validation requirements vary. Please allow time for responsible triage and avoid public disclosure until a coordinated outcome is agreed.

Thank you for helping protect MSP operators, report recipients, and the trust boundary behind their client reports.
