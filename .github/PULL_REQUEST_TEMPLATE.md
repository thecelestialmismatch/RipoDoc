## Summary

Describe the problem and the change in a few direct sentences. State the MSP operator, report recipient, or maintainer workflow affected.

## Scope

- [ ] This pull request is focused; unrelated cleanup and dependency churn are excluded.
- [ ] I reviewed the public claims and copy affected by this change for accuracy.
- [ ] I did not add customer data, secrets, real report artifacts, signed links, or production identifiers.

## Trust-boundary review

Check every relevant statement and explain any checked item below.

- [ ] Evidence authorization, scope, recipient binding, expiry, revocation, provenance, or audit behavior changes.
- [ ] Authentication, session, reset/verification-code, CAPTCHA, rate-limit, or CSRF behavior changes.
- [ ] Tenant isolation, roles, report ownership, administrative access, or artifact access changes.
- [ ] Private authoring worker, capability, network, or container behavior changes.
- [ ] Database migration, environment variable, self-hosted deployment, or production preflight changes.
- [ ] Healthcare Mode B, webhook, regulated-data, legal, privacy, or public compliance language changes.
- [ ] None of the above applies.

Boundary notes:

<!-- Explain why the existing control remains sufficient, which tests cover it, and any operator action required. -->

## Validation

- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run verify`
- [ ] Relevant manual route, responsive, or deployment check
- [ ] Focused denial-path test, if authorization or security behavior changed

Commands and outcomes:

```text

```

## Documentation and release impact

- [ ] No documentation change is needed, and I explained why.
- [ ] README, runbook, environment reference, threat model, legal-status page, or public copy was updated.
- [ ] A migration, rollback step, or operator action is required; it is documented below.

Notes:

<!-- Mention docs updated, migration order, release steps, or why none are needed. -->

## Screenshots or evidence

For visible public-product changes, include before/after screenshots or describe the manual check. Use only synthetic, public, or approved redacted data.
