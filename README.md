# RipoDoc

> **Secure, interactive client reports for managed service providers.**
>
> Send a normal PDF where a reader can click an approved figure and inspect the precise evidence behind it. Delivery is recipient-bound, time-bound, revocable, and auditable.

RipoDoc preserves the client reporting workflow MSPs already use while adding a defensible evidence layer. It supports two complementary paths: render a report from a validated manifest, or overlay link annotations onto an existing PDF without redrawing its pages.

| Capability | What RipoDoc provides |
| --- | --- |
| Familiar client experience | A standard PDF that opens in common viewers and keeps the report format your clients know. |
| Evidence on demand | One click opens only the rows and provenance approved for that figure. |
| Controlled delivery | Signed evidence claims bind the report, version, recipient hash, expiry, and revocation identifier. |
| Accountable publication | Report manifests validate before storage; every figure has approved provenance. |
| Auditability | Granted and denied access can be recorded in a SHA-256 hash chain. |
| MSP-ready workspace | A customer dashboard, security-control view, downloadable report registry, and private administrator workspace. |

## Product routes

| Route | Audience | Purpose |
| --- | --- | --- |
| `/` | Prospects and MSP teams | Outcome-led product page with an interactive sample report backed by real fixture data. |
| `/upload` | Self-hosted operators | Propose overlays and create a downloadable clickable PDF through a configured local RipoDoc worker. |
| `/api/health` | Deployment monitoring | No-store operational health response with safe configuration indicators only; never returns tenants, reports, recipients, sessions, or secrets. |
| `/dashboard` | Verified MSP workspace users | Review only reports owned by the authenticated tenant; report manifests require tenant-scoped session authorization. |
| `/signup`, `/login`, `/verify-email`, `/forgot-password`, `/reset-password` | MSP workspace users | Complete account lifecycle with email activation, one-time codes, private sessions, rate limits, and CAPTCHA protection. |
| `/security` | Operators and security reviewers | Inspect safe, live operational posture without exposing secrets, recipient identities, or audit records. |
| `/e/[token]/[elementId]` | Intended report recipient | Open the evidence authorized by a signed link. |
| `/admin` | Private operators only | Protected report and recipient operations workspace. It is intentionally excluded from public navigation. |

## Quick start

RipoDoc requires Node.js **22.6 or newer** because the toolchain uses native TypeScript stripping. The following sequence runs the public app and produces a locally clickable sample report.

```bash
git clone https://github.com/thecelestialmismatch/RipoDoc.git
cd RipoDoc

# Install the frontend and project dependencies.
npm install
npm install --prefix web/frontend

# Use a strong server-only signing secret for evidence links.
export RIPODOC_EVIDENCE_SECRET="$(openssl rand -base64 32)"

# Start the customer-facing application.
npm --prefix web/frontend run dev

# In a second terminal, generate a PDF whose evidence links point at localhost.
npm run build:pdf:local
```

Open `build/demo-report.local.pdf` and select a report figure. The local application will show the approved evidence rows, provenance, and review metadata for that figure.

## Download and self-host the complete platform

RipoDoc is downloadable as a complete MSP deployment bundle, not merely a public marketing site. The bundle starts PostgreSQL, the protected workspace application, and a loopback-only PDF worker together. Copy the repository, create the required environment values, then run:

```bash
git clone https://github.com/thecelestialmismatch/RipoDoc.git
cd RipoDoc
export POSTGRES_PASSWORD="$(openssl rand -base64 32)"
export RIPODOC_AUTH_SECRET="$(openssl rand -base64 32)"
export RIPODOC_EVIDENCE_SECRET="$(openssl rand -base64 32)"
# Set RIPODOC_APP_ORIGIN, RIPODOC_RESEND_API_KEY, RIPODOC_EMAIL_FROM,
# RIPODOC_TURNSTILE_SECRET, and NEXT_PUBLIC_RIPODOC_TURNSTILE_SITE_KEY.
docker compose -f docker-compose.selfhost.yml up --build
```

The browser-facing app listens on `${RIPODOC_PORT:-3000}`. PostgreSQL is internal to the compose network, and the PDF worker binds its host port to `127.0.0.1` by default. Deploy it behind an HTTPS reverse proxy using the same origin configured in `RIPODOC_APP_ORIGIN`.

## Self-hosted report authoring

The `/upload` route intentionally uses a **separate local processing worker**. A public Vercel site must not receive an MSP's client report by default. The authoring sequence is explicit: select a validated RipoDoc manifest, upload its matching PDF, download and review the proposed click zones, add an approver and approval time to every zone, upload the reviewed proposal, then publish the downloadable PDF. For local development, start the worker with Docker and open the frontend locally.

```bash
# The worker signs links with the same secret as the evidence-serving app.
export RIPODOC_EVIDENCE_SECRET="$(openssl rand -base64 32)"

# Start the local PDF worker on http://localhost:4000/api/local
npm run docker:run

# In a second terminal, run the Next.js app.
npm --prefix web/frontend run dev
```

The upload page defaults to `http://localhost:4000/api/local`. Set `NEXT_PUBLIC_LOCAL_API` only when your browser should use a different trusted, self-hosted worker endpoint.

| Mode | Use it when | Command |
| --- | --- | --- |
| Overlay | You want to retain the existing PDF your MSP already sends. | `npm run overlay:propose` then `npm run overlay:sample` |
| Generate | You want RipoDoc to render a complete PDF from a report manifest. | `npm run build:pdf` or `npm run build:pdf:local` |
| Local authoring UI | You want a browser interface connected to your self-hosted worker. | `npm run docker:run` and `npm --prefix web/frontend run dev` |

## Environment configuration

Store all values below in the relevant server environment. Do not expose `RIPODOC_EVIDENCE_SECRET` or `RIPODOC_ADMIN_ACCESS_KEY` to the browser.

| Variable | Required | Purpose |
| --- | --- | --- |
| `RIPODOC_EVIDENCE_SECRET` | Yes for evidence delivery | A 32-character-or-longer secret used to sign recipient-bound evidence claims. |
| `RIPODOC_ADMIN_ACCESS_KEY` | Yes for legacy `/admin` | A 16-character-or-longer server-only administrator access key. The browser receives only a signed HttpOnly session cookie. |
| `RIPODOC_DATABASE_URL` | Yes for workspace authentication | PostgreSQL connection URL for tenant users, opaque sessions, one-time codes, rate-limit counters, and tenant report records. |
| `RIPODOC_AUTH_SECRET` | Yes for workspace authentication | A separate 32-character-or-longer server-only HMAC secret for session, privacy, and one-time-code hashing. |
| `RIPODOC_APP_ORIGIN` | Yes for workspace authentication | Canonical HTTPS application origin used in email messages and CSRF checks. |
| `RIPODOC_RESEND_API_KEY` | Yes for workspace authentication | Server-only Resend API key used for verification, reset, and recipient-proof codes. |
| `RIPODOC_EMAIL_FROM` | Yes for workspace authentication | Verified sender address for security notices. |
| `RIPODOC_TURNSTILE_SECRET` | Yes in production | Server-only Cloudflare Turnstile secret used by every authentication action. |
| `NEXT_PUBLIC_RIPODOC_TURNSTILE_SITE_KEY` | Yes in production | Public Cloudflare Turnstile site key for the authentication forms. |
| `RIPODOC_AUDIT_LOG` | Recommended on durable infrastructure | File path for a persisted, locally verifiable hash-chained audit log. Without it, events are emitted as structured stdout. |
| `RIPODOC_REVOKED_JTIS` | Optional | Comma-separated claim identifiers that must no longer authorize evidence access. |
| `RIPODOC_ALLOW_EXPORT` | Optional | Set to `false` to disable evidence CSV export. The default is enabled. |
| `RIPODOC_CONTENT_ROOT` | Optional | Filesystem root for published report manifests in a self-hosted runtime. Defaults to `content/reports` under the active working directory. |
| `NEXT_PUBLIC_LOCAL_API` | Optional | Browser-visible URL of a trusted, self-hosted PDF worker. Defaults to `http://localhost:4000/api/local` during local use. |

## Security model

RipoDoc does not treat possession of a PDF URL as permanent authorization. Its evidence token contains the report identifier, version, recipient email hash, expiry, and revocation identifier; the email address itself is not embedded in the token. Before rendering scoped evidence, the recipient must complete a one-time code challenge delivered to the address whose hash is embedded in the signed claim. One-time codes are stored only as keyed hashes, expire quickly, are consumed atomically, and are never placed in links or audit logs.

### Authentication technology stack

The workspace identity service is deliberately implemented as a small, server-side TypeScript boundary rather than a browser-side identity shim. Next.js 16 App Router supplies the request and response surfaces; Node.js `crypto` provides random generation, HMAC, constant-time comparison, and scrypt; PostgreSQL is the durable authority for users, sessions, one-time codes, rate limits, audit events, tenants, and report ownership; the `pg` client uses parameterized statements and transactions; Resend delivers verification, recovery, and recipient-proof codes through HTTPS; and Cloudflare Turnstile is verified server-side for production anti-automation. The Next.js middleware sets the browser security headers and CSRF cookie.

| Required authentication control | Shipped implementation | Primary source |
| --- | --- | --- |
| Enumeration-resistant lifecycle | Signup and recovery return one generic message, and login performs a dummy scrypt verification for unknown accounts before a fixed 900 ms response floor. | [`service.ts`](web/frontend/src/lib/auth/service.ts), [`primitives.ts`](web/frontend/src/lib/auth/primitives.ts) |
| Rate limiting and CAPTCHA | PostgreSQL rate-limit buckets enforce address and IP limits; every production auth action verifies Turnstile before it invokes the auth service. | [`service.ts`](web/frontend/src/lib/auth/service.ts), [`captcha.ts`](web/frontend/src/lib/auth/captcha.ts), [`[action]/route.ts`](web/frontend/src/app/api/auth/[action]/route.ts) |
| Verified account activation | New tenants are inactive until a one-time verification code is consumed; sign-in excludes unverified or disabled users. | [`service.ts`](web/frontend/src/lib/auth/service.ts) |
| Slow password hashing | Passwords use Node.js scrypt with a random 16-byte salt and a 64-byte derived key; no plaintext, MD5, or raw SHA-256 password storage is used. | [`primitives.ts`](web/frontend/src/lib/auth/primitives.ts) |
| Secure reset and proof codes | Codes are cryptographically random, HMAC-hashed before storage, single-use through an atomic transaction, delivered outside URLs, and expire after 30 minutes. | [`service.ts`](web/frontend/src/lib/auth/service.ts), [`recipient-proof.ts`](web/frontend/src/lib/evidence/recipient-proof.ts) |
| Session and CSRF controls | Opaque session secrets are stored only as keyed hashes; session cookies use `HttpOnly`, strict same-site handling, and production-only `Secure`; state-changing actions require same-origin plus double-submit CSRF validation. | [`server.ts`](web/frontend/src/lib/auth/server.ts), [`middleware.ts`](web/frontend/src/middleware.ts) |

A deeper test and control inventory is maintained in [`docs/05-security/authentication-and-test-coverage.md`](docs/05-security/authentication-and-test-coverage.md). The self-hosted operator walkthrough and read-only 20-control security assessment are maintained in [`docs/05-security/self-hosted-deployment-and-read-only-audit.md`](docs/05-security/self-hosted-deployment-and-read-only-audit.md).

> RipoDoc fails closed for hosted account actions until PostgreSQL, Resend, the canonical app origin, an authentication secret, and the production Turnstile configuration are present. It never substitutes ephemeral Vercel filesystem state or silent email failure for a durable identity deployment.

> The evidence rows are not embedded in the PDF. Forwarding the document does not automatically forward the underlying dataset.

Published manifests are schema-validated and immutable at the file-store boundary. When a durable `RIPODOC_AUDIT_LOG` is configured, audit events can be verified with:

```bash
npm run audit:verify -- --path /secure/audit/evidence-access.jsonl
```

The `/security` page provides operator-safe indicators for this posture. It never displays signing secrets, token identifiers, recipient identities, or audit-log contents.

## Verification

The repository uses the built-in Node.js test runner for evidence and application-runtime boundaries. The current regression suite completes **133 tests** with no failures, including an end-to-end local worker test that verifies the manifest requirement, review gate, signed publication, and PDF download, followed by clean linting, type checking, and a production build. See [`docs/05-security/authentication-and-test-coverage.md`](docs/05-security/authentication-and-test-coverage.md) for the full file-by-file coverage map.

```bash
npm test              # evidence, audit, runtime-posture, and admin-key tests
npm run lint          # ESLint for the Next.js frontend
npm run typecheck     # strict TypeScript checks for web and tools
npm run verify        # typecheck + test + production frontend build
```

## Deployment

The public product site is designed for Vercel deployment from the `main` branch. Before enabling workspace accounts on Vercel, provision PostgreSQL and configure `RIPODOC_DATABASE_URL`, `RIPODOC_AUTH_SECRET`, `RIPODOC_APP_ORIGIN`, Resend, and Turnstile variables listed above. The application fails closed for account actions until that durable authentication configuration exists.

The document processor is intentionally not bundled into the public Vercel application. Deploy the worker separately on infrastructure you control, then configure its trusted URL through `NEXT_PUBLIC_LOCAL_API` for the operator environment. This separation prevents report files from being silently routed through a public marketing deployment.

| Release gate | Required result |
| --- | --- |
| Automated checks | `npm run verify` exits successfully. |
| Public route review | `/`, `/upload`, `/dashboard`, `/security`, and the safe `/api/health` deployment probe render without broken navigation. |
| Private workspace review | `/admin` redirects unauthenticated visitors to `/admin/login`. |
| Worker review | A validated manifest, matching PDF, and reviewed placement proposal produce a downloadable PDF from a reachable, trusted worker endpoint. |
| Environment review | Server-only variables are present in the deployment environment and never committed. |

## Project structure

```text
web/frontend/                 Next.js App Router application
  src/app/                    Public, customer, evidence, and admin routes
  src/lib/evidence/           Manifest validation, tokens, audit, storage, posture
  src/lib/admin/              HMAC session helpers for private operations
  content/reports/            Validated published report manifests

tools/evidence-pdf/           PDF generator, overlay engine, fixtures, and tests
docker/local/                 Local self-hosted authoring worker
var/msp_pitch_deck/           12-slide MSP sales and marketing pitch deck
DESIGN.md                     RipoDoc visual system and interface standards
```

## Sales and product materials

The MSP sales deck is maintained in [`var/msp_pitch_deck/`](var/msp_pitch_deck/). It explains the reporting problem, the RipoDoc evidence workflow, integration posture, security approach, onboarding path, and commercial positioning.

The product design system is maintained in [`DESIGN.md`](DESIGN.md). It documents the RipoDoc navy, blue, and teal visual language; layout principles; component behavior; accessibility expectations; and responsive constraints.

## Contributing

Keep trust boundaries explicit. Any change that affects evidence authorization, recipient binding, link expiry, revocation, report manifest validation, or audit behavior must include focused tests. Keep the public website truthful about deployment capabilities: a public preview is not a substitute for an explicitly configured self-hosted document processor.

## License

See [`LICENSE`](LICENSE) for the repository license terms.
