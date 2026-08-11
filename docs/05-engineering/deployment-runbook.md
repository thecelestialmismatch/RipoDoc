# RipoDoc deployment runbook

This document separates what RipoDoc ships today from the longer-term API and managed-worker architecture. The distinction is intentional: the public product experience can deploy to Vercel, while MSP report files should be processed only by an explicitly configured, trusted worker.

## Current release topology

| Component | Current deployment model | Operational note |
| --- | --- | --- |
| Public product application | Next.js application on Vercel | Serves the marketing site, interactive demo, evidence pages, customer dashboard, security posture, and administrator sign-in route. |
| Evidence-manifest store | Filesystem under `content/reports` | Suitable for the shipped demo and self-hosted setup. A database/object-store implementation can preserve the same module API later. |
| PDF generator and overlay engine | Local Node.js CLI | Generates or overlays link annotations in a controlled local environment. |
| Local authoring worker | Docker service on port 4000 | Receives a report only from an operator browser configured to use it. It is not part of the public Vercel deployment. |
| Audit verifier | Local Node.js CLI | Verifies an append-only hash chain when a durable `RIPODOC_AUDIT_LOG` path is available. |

## Vercel release procedure

1. Run the complete release suite from the repository root.

   ```bash
   npm run verify
   ```

2. Push a reviewed change to `main`. The connected Vercel project deploys the public application from that branch.

3. Configure server-only environment values in the Vercel project. Do not commit any secret or include it in a `NEXT_PUBLIC_` variable.

   | Variable | Required for | Release requirement |
   | --- | --- | --- |
   | `RIPODOC_EVIDENCE_SECRET` | Recipient-bound evidence links | At least 32 characters; set before generating links that point to the deployed origin. |
   | `RIPODOC_ADMIN_ACCESS_KEY` | Private `/admin` workspace | At least 16 characters; set before enabling administrator sign-in. |
   | `RIPODOC_REVOKED_JTIS` | Token revocation | Optional comma-separated token identifiers. |
   | `RIPODOC_ALLOW_EXPORT` | Evidence CSV export | Optional. Set to `false` to disable export. |

4. Confirm the public deployment routes render and link correctly: `/`, `/dashboard`, `/security`, and `/upload`.

5. Confirm that `/admin` redirects an unauthenticated request to `/admin/login`. The private route must not be added to public navigation.

6. Confirm that the `/security` page reports only safe runtime state. It must not display evidence secrets, recipient identities, raw token identifiers, or audit-log records.

## Self-hosted authoring worker

The `/upload` route is deliberately an operator workflow, not a public file-ingestion endpoint. An operator provides a validated RipoDoc manifest and matching PDF, reviews every generated click-zone proposal, adds `approvedBy` and `approvedAt` values to each selected zone, and only then requests publication. The deployed public website explains this requirement rather than silently proxying a client report through a marketing environment.

Start the local worker with Docker. It requires the same signing secret used by the evidence-serving RipoDoc application, because the worker creates the recipient-bound evidence links in the output PDF.

```bash
export RIPODOC_EVIDENCE_SECRET="$(openssl rand -base64 32)"
npm run docker:run
```

The worker listens on `http://localhost:4000/api/local`. Start the frontend separately:

```bash
npm --prefix web/frontend run dev
```

For a worker hosted on trusted infrastructure, set the browser-visible endpoint during the frontend build:

```bash
export NEXT_PUBLIC_LOCAL_API="https://worker.internal.example/api/local"
```

Only point this variable at a worker that is operated by the MSP or explicitly approved for that client-report data. Validate its access controls, transport security, storage policy, and retention model before enabling it for production reports.

## Verification and release gates

| Gate | Command or check | Expected result |
| --- | --- | --- |
| Lint | `npm run lint` | No lint errors or warnings. |
| Strict types | `npm run typecheck` | Web and tool TypeScript projects compile without errors. |
| Trust-boundary tests | `npm test` | All Node test suites pass. The current suite covers PDF generation, overlay safety, tokens, audit verification, manifest discovery, runtime posture, administrator-key validation, and the local worker’s manifest/review/publish/download flow. |
| Production build | `npm run build:web` | The Next.js production build completes. |
| Unified release check | `npm run verify` | Typecheck, test, and production build all pass. |
| Public smoke test | Browser review | Public routes render; the marketing demo opens real scoped sample evidence. |
| Private-route smoke test | Browser review | `/admin` requires a valid signed session. |
| Authoring smoke test | Local worker review | A PDF receives proposed overlays, publishes, and downloads from the configured worker. |

## Audit-log verification

When a durable audit-log path is available, verify the chain after deployment or operational review:

```bash
npm run audit:verify -- --path /secure/audit/evidence-access.jsonl
```

The correct security claim is **tamper-evident**, not tamper-proof: deletion, reordering, or modification of a record breaks the chain from that point onward and is detectable during verification.

## Future managed architecture

The repository also contains a Go API scaffold, migrations, and a future-oriented architecture plan. A later managed deployment may add tenant-aware storage, durable job execution, database-backed auditing, and a managed PDF worker. Those additions must preserve the current trust properties: explicit recipient binding, expiry, revocation, schema-validated manifests, scoped evidence delivery, and verifiable audit history.
