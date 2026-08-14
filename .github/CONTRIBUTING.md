# Contributing to RipoDoc

Thank you for improving RipoDoc. The project exists to make a client-report claim easier to inspect **without** making the underlying evidence less controlled. That means product quality, security, operator reality, and honest public claims are all part of every contribution.

## Before you start

Please search [existing issues](https://github.com/thecelestialmismatch/RipoDoc/issues) and pull requests before opening a new thread. For a substantial change, open an issue first so the problem, user, deployment posture, and security implications can be discussed before implementation begins.

Do **not** include client data, report PDFs, recipient addresses, access links, secrets, API keys, production logs, or production screenshots in an issue, pull request, fixture, test, or discussion. Use synthetic or approved redacted material only.

Security vulnerabilities must follow the private process in [SECURITY.md](SECURITY.md). Do not create a public issue for a suspected exploit or sensitive configuration issue.

## Development setup

RipoDoc requires Node.js **22.6 or newer**.

```bash
git clone https://github.com/thecelestialmismatch/RipoDoc.git
cd RipoDoc
npm install
npm install --prefix web/frontend

export RIPODOC_EVIDENCE_SECRET="$(openssl rand -base64 32)"
npm --prefix web/frontend run dev
```

For the locally clickable demo fixture:

```bash
npm run build:pdf:local
```

The full self-hosted stack and its production gate are described in the [self-hosted operations runbook](../docs/05-engineering/self-hosted-operations-runbook.md).

## A contribution workflow that reviewers can trust

1. **State the user-facing and boundary impact.** Explain what changes for an MSP operator, report recipient, or reviewer. Call out any effect on authorization, tenant scope, audit records, data retention, or public product claims.
2. **Keep the change focused.** Avoid unrelated formatting, refactors, or dependency churn in the same pull request.
3. **Add or adjust tests.** Behavior changes require focused regression coverage. Trust-boundary changes require both the expected path and the relevant denial path.
4. **Document operational impact.** Update runbooks, environment documentation, migration steps, or security documentation when an operator must do something differently.
5. **Run the release checks.**

   ```bash
   npm run verify
   npm run lint
   ```

6. **Describe verification in the pull request.** Include exact commands, relevant test names, and any manual route review. If a check cannot run, say why and state what remains unverified.

## Areas where extra care is required

| Area | Required standard |
| --- | --- |
| Evidence access | Preserve recipient binding, report/version binding, explicit expiry, revocation checks, and least-data response. |
| Authentication | Preserve generic enumeration-resistant responses, slow password hashing, one-time-code handling, rate limits, CAPTCHA verification, CSRF checks, and opaque sessions. |
| Worker boundary | Never expose worker URLs or credentials to the browser. Preserve short-lived, single-use, tenant-bound server capabilities and denial-path tests. |
| Multi-tenancy | Every report, artifact, draft, administrative action, and audit query must be scoped to the authenticated tenant and role. |
| Production posture | Do not make hosted account or intake behavior permissive when durable configuration is absent. Fail closed. |
| Healthcare context | Do not introduce PHI/ePHI handling or language that implies HIPAA certification, BAA readiness, or a regulated-data authorization without documented review. |
| Public claims | Do not add invented customer logos, review scores, compliance promises, performance figures, pricing, legal commitments, or traction claims. |

## Design and documentation contributions

The public experience uses the **proof-canvas** visual language: a familiar document, a nearby evidence rail, and visible boundaries. New public copy should favor concrete workflow language over generic SaaS superlatives. See [DESIGN.md](../DESIGN.md) and the [public-experience baseline](../docs/01-research/public-experience-and-discovery-baseline.md).

Documentation should distinguish one of the following clearly:

- **Verified implementation fact** — demonstrable from source, tests, configuration, or an approved operational record.
- **Product intent or hypothesis** — a direction to validate, not a customer outcome already achieved.
- **Pending commercial or legal decision** — a decision owned by the business and, where appropriate, counsel.

## Pull-request expectations

A good RipoDoc pull request is easy to review and safe to ship. It contains a concise problem statement, a limited change set, tests proportional to risk, documentation when operations change, and a truthful verification record. Use the repository pull-request template; do not delete its security or validation sections.

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
