# RipoDoc Threat Model

## Assets
- Customer report data (PDFs, CSVs, extracted elements)
- Authentication credentials and session tokens
- Share link tokens
- Audit log integrity

## Threats & Mitigations
| Threat | Impact | Mitigation |
|---|---|---|
| Cross-tenant data leakage | Critical | PostgreSQL RLS + app-layer tenant validation on every query |
| Malicious PDF upload | High | Malware scan, JS stripping, sandboxed processing, file type validation |
| Share link brute force | High | Cryptographic tokens (256-bit), rate limiting, expiry, revocation |
| Prompt injection in PDFs | Medium | AI agents never execute instructions from documents; structured output only |
| LLM data hallucination | Medium | AI outputs are suggestions only; deterministic SQL for all numbers |
| Insider threat | Medium | Immutable audit log, least-privilege IAM, no credentials in logs |

## Absolute Rules
1. No public sharing by default.
2. No AI agent can publish, export, or modify access.
3. All numerical data is deterministic (SQL/Go), never LLM-generated.
