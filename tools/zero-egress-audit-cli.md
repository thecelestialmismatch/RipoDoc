# Zero-Egress Audit CLI

`tools/zero-egress-audit-cli.ts` proves the Evidence Composer’s local PDF intake and source-linked draft workflow does not issue an off-origin or same-origin API request during the sensitive action window.

## Local use

Build once, then run the production-mode audit:

```bash
npm run audit:zero-egress:ci
```

Run the CLI directly when a production build already exists:

```bash
npm run audit:zero-egress -- --mode production --out build/zero-egress-audit/evidence-composer.json
```

Use `npm run audit:zero-egress -- --help` for all options. The CLI defaults to `/usr/bin/chromium`; use `--chromium <path>` for another local binary.

## CI contract

The command exits with:

| Code | Meaning |
|---:|---|
| `0` | Static, runtime, storage, and production-harness checks passed. |
| `1` | Audit failed; JSON evidence is still written when the output path is available. |
| `2` | Invalid argument or missing local prerequisite. |

The supplied workflow, `.github/workflows/zero-egress-audit.yml`, runs on relevant pull requests and uploads `build/zero-egress-audit/evidence-composer.json` even on failure.

## Evidence scope

Capture begins immediately before the fixture PDF is selected and ends after a source-linked local draft is visible. A pass requires:

- zero `off-origin` requests;
- zero same-origin `/api/` requests;
- zero local/session storage entries;
- bundled PDF.js worker configuration with worker fetching disabled;
- dashboard telemetry suppression; and
- an HTTP `404` response from the fixture harness when local test mode is disabled.

Same-origin scripts and PDF.js worker assets are reported as `same-origin-asset` and disclosed in the JSON artifact. They are application resources, not document egress.
