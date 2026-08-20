# Zero-Egress Audit CLI

`tools/zero-egress-audit-cli.ts` validates that the Evidence Composer’s local PDF intake and source-linked draft workflow does not make an off-origin or same-origin API request during its sensitive action window. It also contains local-only, expected-failure simulations that prove the audit interceptor detects and fails closed on forbidden fallback attempts.

## Baseline audit

Build once, then run the production-mode baseline audit:

```bash
npm run audit:zero-egress:ci
```

Run the CLI directly when a production build already exists:

```bash
npm run audit:zero-egress -- --mode production --out build/zero-egress-audit/evidence-composer.json
```

A baseline pass requires zero forbidden requests, empty browser storage, local PDF.js worker settings, dashboard telemetry suppression, and a `404` response from the fixture-only harness when test mode is disabled.

## Fail-closed simulation matrix

Run each simulation only in local or CI verification. Each command intentionally exits `1`; that non-zero result is success **only** when its JSON artifact reports `outcome: "expected-failure"` and `simulationValidated: true`.

| Simulation | Command suffix | Expected request class | Sentinel safety |
|---|---|---|---|
| External CDN fallback | `--simulate external-cdn` | `off-origin` | A reserved `.invalid` PDF-worker URL is intercepted and aborted locally. |
| External API fallback | `--simulate external-api` | `off-origin` | A reserved `.invalid` telemetry URL is intercepted and aborted locally. |
| Same-origin API fallback | `--simulate same-origin-api` | `same-origin-api` | The isolated local `/api/` URL is intercepted and aborted before endpoint execution. |

For example:

```bash
npm run audit:zero-egress -- --mode production --simulate external-cdn --out build/zero-egress-audit/external-cdn.json
```

The test browser bypasses CSP only inside its temporary automated context so the external sentinel reaches the local request interceptor. The interceptor aborts it before transport. The production CSP, the Composer implementation, and the deployed site are unchanged.

> These simulations prove the CI audit detects and rejects the tested browser request events. They do not claim to neutralize a malicious browser extension, a compromised browser runtime, or arbitrary infrastructure compromise.

## Exit contract

| Code | Meaning |
|---:|---|
| `0` | The baseline audit passed; no forbidden request was observed. |
| `1` | The baseline audit failed, **or** an expected-failure simulation validated its fail-closed behavior. Read the JSON artifact to distinguish the outcome. |
| `2` | The command-line arguments are invalid. |

## JSON evidence artifact

The CLI writes a JSON artifact for successful baseline runs, expected-failure simulations, and audit/infrastructure failures whenever the output path is available. Important fields are:

| Field | Meaning |
|---|---|
| `outcome` | `passed`, `expected-failure`, or `failed`. |
| `counts` | Counts for `off-origin`, `same-origin-api`, and disclosed `same-origin-asset` requests. |
| `browserStorage` | Captured `localStorage` and `sessionStorage` entry totals. |
| `simulation` | The sentinel mode, target, expected class, local-abort flag, and exact match count. Omitted for a baseline audit. |
| `simulationValidated` | `true` only when exactly one intended forbidden request was observed and locally aborted while all other safeguards passed. |
| `productionHarnessStatus` | Must be `404`, proving that the fixture-only route remains unavailable without test mode. |

The supplied workflow, `.github/workflows/zero-egress-audit.yml`, runs the baseline audit and every expected-failure simulation on relevant pull requests. It uploads all artifacts even when a job fails.

Use `npm run audit:zero-egress -- --help` for all options. The CLI defaults to `/usr/bin/chromium`; use `--chromium <path>` for another local binary.
