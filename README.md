<p align="center">
  <a href="https://www.ripodoc.com"><img src="web/frontend/public/ripodoc-mark.png" width="96" alt="RipoDoc mark" /></a>
</p>

# RipoDoc

> **Controlled evidence delivery for MSP client reports.**
>
> Keep the PDF your client already trusts. Let a selected figure open the **approved evidence** behind it—scoped to the intended reader, time-limited, revocable, and audit-aware.

[![Node.js 22.6+](https://img.shields.io/badge/Node.js-%E2%89%A522.6-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/) [![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Deployment](https://img.shields.io/badge/Deployment-self--hostable-007E83?style=flat-square)](https://www.ripodoc.com/download)

**Website:** [ripodoc.com](https://www.ripodoc.com) · **MSP fit:** [for MSPs](https://www.ripodoc.com/for-msps) · **Product sample:** [inspect a claim](https://www.ripodoc.com/#sample-report) · **Method:** [how it works](https://www.ripodoc.com/how-it-works) · **Security:** [delivery boundary](https://www.ripodoc.com/security) · **Self-hosting:** [deployment guide](https://www.ripodoc.com/download)

---

## What RipoDoc is for

Managed Service Providers send QBRs, monthly service reports, security reports, and executive updates as PDFs. When a reader questions a material number, the usual answer is an over-broad export, another portal, or a follow-up meeting. RipoDoc creates a deliberately narrow proof path for that moment.

| RipoDoc is | RipoDoc is not |
| --- | --- |
| An evidence-delivery layer for one approved client-report claim | A replacement for PSA, RMM, BI, documentation, or client-portal platforms |
| A workflow built on reviewed structured data, provenance, and human approval | A promise to extract defensible evidence from arbitrary PDF charts |
| A recipient-aware, expiring, revocable proof handoff | A permanent, anonymous public-share link |
| A self-hostable application with a private authoring-worker boundary | A claim that the public website accepts customer report data |

> **Hosted workspace status:** The public deployment is intentionally an evaluation and documentation surface. Account actions and authoring fail closed until durable identity, email, CAPTCHA, audit storage, and private-worker configuration pass the relevant release gate. Do not submit client data to the public site.

## Product flow

```text
Reviewed source data
        │
        ▼
Approve a claim, supporting rows, provenance, recipient, and expiry
        │
        ▼
Publish a validated report manifest
        │
        ▼
Deliver the familiar PDF
        │
        ▼
The intended reader opens a controlled proof view for that claim
```

The proof view returns **only approved supporting rows** for the requested figure after its current access condition is evaluated. Evidence-access events can be recorded in a tamper-evident hash chain and verified offline. Operators can review an **Evidence Delivery Receipt** for a report version and selected claim: a recipient-safe record of declared source, review, delivery, expiry posture, and aggregate durable activity when configured.

The receipt deliberately excludes recipient email addresses, signed-link material, source queries, and supporting rows.

## See the real product surface

<p align="center">
  <a href="https://www.ripodoc.com/#sample-report"><img src="docs/assets/ripodoc-claim-sample.png" alt="RipoDoc interactive sample report with a selected report claim and adjacent approved evidence" width="900" /></a>
</p>

The image and public [interactive claim sample](https://www.ripodoc.com/#sample-report) use only shipped fixture data—never client information. The capture-based [demo tour](docs/assets/ripodoc-demo-tour.mp4) and [GIF fallback](docs/assets/ripodoc-demo-tour.gif) show actual local product surfaces; they do not simulate configured hosted customer workspaces or make performance claims.

## Local evaluation

RipoDoc requires **Node.js 22.6 or newer** because the toolchain uses native TypeScript stripping. Source access is intentionally permissioned. If you are evaluating a self-hosted deployment, request an authorized source bundle through the [report diagnostic](https://www.ripodoc.com/founding-partners); do not rely on a public archive or a copied link.

```bash
# Obtain the permissioned RipoDoc source bundle through an authorized channel.
git clone <authorized-ripodoc-source-url> RipoDoc
cd RipoDoc

npm install
npm install --prefix web/frontend

# A server-only signing secret is required for local evidence delivery.
export RIPODOC_EVIDENCE_SECRET="$(openssl rand -base64 32)"

# Start the local application.
npm --prefix web/frontend run dev
```

In another terminal, create a local clickable fixture report:

```bash
npm run build:pdf:local
```

Open `build/demo-report.local.pdf`, select a marked report figure, and inspect the approved fixture evidence in the local app.

## Self-host the complete application

RipoDoc is a complete deployment bundle, not a marketing-only repository. The self-hosted architecture includes the Next.js application, PostgreSQL, a private PDF authoring worker, migrations, tests, hardened Compose defaults, and operating runbooks.

```bash
# Start from an authorized source bundle.
cd RipoDoc

# Copy the non-secret configuration contract and restrict local permissions.
cp .env.example .env
chmod 600 .env
# Replace every placeholder with an independent real secret or provider value.
# Compose constructs RIPODOC_DATABASE_URL internally; do not add it to .env.
$EDITOR .env

docker compose -f docker-compose.selfhost.yml config
docker compose -f docker-compose.selfhost.yml up --build -d

# Run the durable production gate from the configured web container,
# where the private PostgreSQL and worker networks are reachable.
docker compose -f docker-compose.selfhost.yml exec -T web sh -c 'cd /app && node --experimental-strip-types tools/production-preflight.ts'
```

| Component | Responsibility | Default boundary |
| --- | --- | --- |
| Web application | Client report workspace, identity, evidence delivery, and operator controls | Canonical HTTPS edge |
| PostgreSQL | Users, opaque sessions, code hashes, tenant/report ownership, rate limits, and durable audit records | Private Compose network |
| Private authoring worker | Proposes and publishes protected clickable PDF artifacts | Trusted web service only |
| Reverse proxy | TLS termination and public routing | Operated by the self-hosting MSP |

The browser never receives the worker credential or direct worker URL. The web service issues short-lived, single-use, tenant-bound capabilities; the worker rejects browser-originated, unsigned, replayed, wrong-purpose, and cross-tenant requests.

Read the [self-hosted operations runbook](docs/05-engineering/self-hosted-operations-runbook.md) before operating a real environment.

### Optional: isolated sales CRM

RipoDoc can optionally synchronize an explicitly consented founding-partner contact request to a separately deployed RipoDoc CRM instance. That CRM is not co-hosted with RipoDoc and is not part of the evidence-delivery path. It receives only business-development fields; it never receives report content, source rows, evidence tokens, recipient proof, audit records, or application secrets. Read the [RipoDoc CRM deployment runbook](deploy/crm/README.md) and [operator/API integration guide](docs/05-engineering/crm-integration-guide.md) before enabling it.

## Security model

| Control | RipoDoc implementation |
| --- | --- |
| Evidence authorization | HMAC-signed claims carry report, version, recipient hash, expiry, and revocation identifier; the email address is never embedded in the token. |
| Reader proof | The intended reader completes a one-time code challenge delivered to the address represented by the signed recipient hash. |
| Least-data delivery | The proof view returns only approved rows behind the requested figure rather than a customer-wide export. |
| Revocation and expiry | Token identifiers can be revoked and evidence claims have explicit expiry. |
| Audit integrity | Access events can be written to a SHA-256 hash chain and verified offline; receipts use aggregate report-level data only when durable summaries are configured. |
| Workspace identity | Passwords use scrypt; sessions and codes are stored as keyed hashes; state-changing actions require same-origin and CSRF validation. |
| Abuse resistance | Production auth actions are rate-limited and use server-verified challenge service when configured; generic lifecycle responses reduce account-enumeration signals. |
| PDF authoring boundary | A private worker accepts only single-use, short-lived, tenant-bound server capabilities. |

Read the [public security-control page](https://www.ripodoc.com/security), [authentication and test coverage](docs/05-security/authentication-and-test-coverage.md), and [worker hardening threat model](docs/05-security/worker-hardening-threat-model.md) for the complete, verifiable boundary.

## Quality gates

A passing build is not production authorization. Every product change should clear the local regression and lint gates; a production-capable self-hosted operation must also pass the authenticated runtime preflight inside its configured web container.

```bash
npm test              # Node built-in regression suite
npm run typecheck     # strict TypeScript: frontend and tools
npm run lint          # frontend lint
npm run verify        # typecheck + tests + production build
```

> Production preflight evaluates durable storage, configuration, migrations, founder-contact encryption, and private-worker reachability from the real runtime. It should be run after deployment, not inferred from a successful build.

## Repository map

```text
web/frontend/                         Next.js App Router product, public site, customer and admin routes
  src/app/                            Product routes, SEO metadata, robots and sitemap
  src/lib/auth/                       Scrypt identity, opaque sessions, CSRF, rate limiting and CAPTCHA boundary
  src/lib/evidence/                   Manifests, recipient-proof flow, tokens, audit, storage and posture
  src/lib/launch/                     Legal-status and healthcare-mode boundary models

tools/evidence-pdf/                   PDF generation, overlay engine, fixtures and regression tests
docker/local/                         Private local/self-hosted PDF authoring worker
migrations/                           PostgreSQL durable identity and evidence-record schema
docs/05-security/                     Threat models, test coverage, advisory and supply-chain evidence
docs/05-engineering/                  Self-hosted operations and RipoDoc CRM integration guides
deploy/crm/                       Separate RipoDoc CRM Compose deployment and CRM integration runbook
```

## Repository and public-claims boundary

The source repository is private by design. It contains verifiable product, technical-control, and self-hosted-operation material. Commercial strategy, market analysis, outreach operations, legal-review working papers, customer or pilot decisions, and launch artefacts are maintained separately and are never part of the source distribution.

**Healthcare Mode B** is a restricted evaluation and self-hosted posture. It is **not** HIPAA certification, a BAA, or a representation that the public RipoDoc service accepts or processes PHI/ePHI. Read the [public boundary statement](https://www.ripodoc.com/legal/healthcare-mode-b) before evaluating healthcare use cases.

## Contributing

RipoDoc is strongest when its workflow, trust boundary, and operating reality stay aligned. We welcome documentation, design, UX, security, testing, integration, and deployment contributions.

1. Read [CONTRIBUTING.md](.github/CONTRIBUTING.md) and the [Code of Conduct](.github/CODE_OF_CONDUCT.md).
2. Search existing issues before opening a new one.
3. Create a focused branch and include tests for every behavior change.
4. Run `npm run verify` and `npm run lint` before requesting review.
5. Never include client reports, recipient data, credentials, access tokens, production secrets, or private decision material in an issue, pull request, fixture, or screenshot.

Report a security vulnerability through the private process in [SECURITY.md](.github/SECURITY.md), not in a public issue.

## License

See [LICENSE](LICENSE) for repository licensing terms.
