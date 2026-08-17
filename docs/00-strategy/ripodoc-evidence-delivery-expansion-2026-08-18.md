# RipoDoc Evidence-Delivery Expansion

**Date:** 18 August 2026  
**Author:** Manus AI  
**Decision:** Expand RipoDoc’s evidence-delivery operations layer, rather than attempting to become a generic MSP portal or generic document data room.

## Executive decision

The relevant MSP platforms concentrate on broad client relationship management: dashboards, QBR automation, strategy, budgets, assets, tickets, user visibility, portal branding, and integrations. CloudRadial documents on-demand QBRs, dashboards, policy reporting, a vCIO planner, and client scoring; Strategy Overview documents a white-labelled portal with planning, assessment, budgets, assets, tickets, and Microsoft 365 content; MSP Report Card documents assessments, review cadence, lifecycle planning, and sales workflow. [1] [2] [3] RipoDoc should **not** clone those domains. Its defensible product category is controlled evidence delivery at the moment a reader challenges a claim in an otherwise familiar client report.

Generic secure-document vendors, meanwhile, emphasize recipient verification, expiry, per-link controls, revocation, watermarks, view analytics, audit events, and integrations. [4] [5] [6] Those are valuable patterns, but copying an entire data-room model would sacrifice RipoDoc’s focused value proposition. The product should apply the strongest of these controls to **approved report evidence** rather than to arbitrary files.

> **Product thesis:** A client report should remain concise. RipoDoc makes the important claim inside it inspectable through a bounded, reviewed, recipient-aware evidence path.

## Competitive capability map

| Buyer job | Broad MSP platforms | Generic secure-document products | RipoDoc’s focused answer |
| --- | --- | --- | --- |
| Prepare and run a QBR | Dashboards, roadmaps, budgets, assessments, meeting workflow | Usually outside their scope | Preserve the existing QBR/report workflow; make selected claims defensible. |
| Give clients a daily portal | Tickets, invoices, assets, service catalog, chat, knowledge base | Not their main job | Deliberately avoid portal sprawl. |
| Share a sensitive document | Links, watermarks, NDAs, downloads, viewer analytics | Primary category | Deliver only the evidence needed to support a selected report claim. |
| Know why a claim can be trusted | Often dashboards and source integrations, but not a reader-level proof boundary | File-level activity, not claim-level context | Pair each clickable claim with source, capture time, reviewer, scope, reader, and expiry. |
| Operate the delivery | High-level account workflow | Link controls and access analytics | Offer an operator-facing proof operations console aligned to immutable report versions. |

## Prioritized expansion plan

| Priority | Capability | Buyer value | Differentiation | Safety / feasibility decision |
| --- | --- | --- | --- | --- |
| **P0 — implement now** | **Proof Operations Console**: evidence coverage, source freshness, review provenance, recipient-safe delivery posture, and durable audit summaries per tenant report. | Lets an MSP assess whether a report is ready to defend before it is sent. | Operates on report claims and approved evidence, not generic documents. | Uses current immutable manifests, tenant report list, hashed-recipient model, and audit records. No raw recipient leakage. |
| **P0 — implement now** | **Recipient Proof Brief**: a consistent report-element summary of claim, source, capture time, reviewer, scope, reader binding, expiry, and access receipt. | Gives an executive a compact answer before the raw supporting rows. | Replaces “open a portal / export data” with a bounded explanation. | Reuses signed token and manifest fields; preserves no-store and fail-closed behavior. |
| **P1 — plan next** | **Delivery lifecycle roster**: per-recipient issuance, individual expiry extension, revocation, reissue, and safe event notifications. | Matches the operational expectation set by secure-link products. | Issue-level delivery for claims and report versions. | Requires a first-class encrypted/hashed delivery-policy store and worker changes; do not bolt it onto manifests. |
| **P1 — plan next** | **Recipient-visible dynamic watermark** and optional view-only export policy. | Adds leak deterrence and accountability. | Watermark carries report/recipient context, not arbitrary file DRM. | Must state clearly that browser controls deter but cannot eliminate screenshots or copying. |
| **P1 — plan next** | **Safe automation surface**: outbound webhooks for access granted, denied, expired, and revoked. | Enables PSA/CRM follow-up without opening the evidence data itself. | Event payloads describe delivery state, not evidence rows. | Needs signed deliveries, retries, allowlists, idempotency, and tenant-scoped configuration. |
| **P2 — validate with customers** | Reusable QBR proof templates and connector-based source refresh. | Reduces authoring effort. | Allows MSP-specific claim patterns without becoming a portal. | Needs founder interviews before integration work and authoritative source mapping. |

## Implementation scope for this release

This release implements the two P0 capabilities:

1. **Proof Operations Console.** Each tenant report receives a manifest-derived coverage score, visible source and review facts, a delivery posture that never exposes the raw recipient address, and a durable Postgres audit summary when that backend is configured. File/stdout deployments remain explicit about the absence of durable analytics rather than inventing metrics.
2. **Recipient Proof Brief.** Each evidence page surfaces a structured, reader-safe answer card above the supporting rows. It distinguishes what the selected evidence supports from the larger report boundary, names the reviewed source and capture time, preserves recipient binding and expiry, and makes the access receipt legible.

The roadmap intentionally excludes a full client portal, ticketing, generic file upload/data rooms, generic AI chat over client data, and unverified compliance promises.

## Product safeguards

The console must remain tenant-scoped, and summary queries must only receive report identifiers obtained through the authenticated tenant workspace. Raw recipient addresses stay out of audit tables and operator analytics. The recipient view never receives audit events from other recipients. A report that cannot prove its evidence boundary must not be labelled “defensible,” “compliant,” or “verified”; the interface should report only explicit manifest facts.

## References

[1]: https://www.cloudradial.com/qbr "CloudRadial — On-Demand QBRs"
[2]: https://www.strategyoverview.com/features/client-portal-msp-software/ "Strategy Overview — Client Portal"
[3]: https://mspreportcard.com/platform "MSP Report Card — Platform"
[4]: https://www.docsend.com/blog/how-to-share-and-track-secure-pdf/ "DocSend — Secure PDF Sharing and Tracking"
[5]: https://docbeacon.io/solutions/secure-document-sharing "DocBeacon — Secure Document Sharing"
[6]: https://digify.com/data-room-api.html "Digify — Data Room and DRM API"
