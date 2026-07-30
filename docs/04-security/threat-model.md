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
| Insider threat | Medium | Hash-chained append-only audit log, least-privilege IAM, no credentials in logs |
| Hostile PDF crashes or hangs the parser | High | Bounded parsing: depth limit on nested objects, every loop advances or throws, capped page-tree and cross-reference traversal, cycle guards on object resolution (`overlay/objects.ts`, `overlay/reader.ts`) |
| Encrypted PDF silently stripped of protection | High | `EncryptedPdfError` — RipoDoc refuses the file rather than re-saving it unprotected |
| Malicious URI injected into a report | High | Only `https` reaches an annotation; `javascript:`, `file:` and `data:` are refused. Loopback `http` requires an explicit opt-in |
| Customer document altered during overlay | High | The original is asserted to be a byte-for-byte prefix of the output; the result is discarded otherwise |
| Link placed on the wrong figure | Medium | Detection is a proposal; a named person approves each zone, bound to the PDF's SHA-256, before publication |
| Audit log edited after the fact | Medium | Each record commits to the previous one's hash; any edit, deletion or reorder is detectable by `npm run audit:verify` |

## Absolute Rules
1. No public sharing by default.
2. No AI agent can publish, export, or modify access.
3. All numerical data is deterministic (SQL), never LLM-generated.
4. A customer's document is appended to, never rewritten.
5. Every evidence zone is approved by a named person before publication.

## Notes on the audit chain

`hash(n) = SHA-256( hash(n-1) ‖ canonical(record n) )`. This does not make the
log unmodifiable — nothing on a writable disk is — it makes modification
**detectable**. That is the honest claim, and the one an assessor cares about.
Anchoring the head hash somewhere the application cannot write (an object-lock
bucket, a customer's own store) is the next step and is not implemented.
