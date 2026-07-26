# RipoDoc Product Requirements Document (PRD)

## Goal
Enable MSPs to publish client reports that remain readable like PDFs while allowing authorised recipients to click any KPI, chart, table, or supported claim and inspect its approved underlying data in an in-page drawer.

## Users
- **MSP Owner/vCIO:** Wants repeatable, profitable reporting that proves value.
- **Report Author/Reviewer:** Creates reports, validates extracted data, approves publication.
- **Client Executive:** Reads the report, clicks charts/KPIs to inspect underlying data without logging into complex BI tools.

## MVP Capabilities
- PDF upload, native text extraction, OCR fallback, CSV import, generic REST ingestion.
- PDF-like report reader with chart/table/KPI click zones.
- Author review queue with provenance, confidence scores, correction, and approval state.
- Searchable, sortable underlying-data table; export only when authorised.
- Customer portal, RBAC, recipient-specific expiring links, revocation, watermarking.
- Immutable published report versions and audit log.

## Explicit Exclusions
- Perfect extraction of every PDF without human review.
- A full dashboard builder.
- Anonymous public reports.
- Write access to CRM, PSA, RMM, or billing platforms.
- Customer-facing AI chatbot in the first 6 months.

## AI Agent Policy
- **Extraction Agent:** Finds report regions, tables, KPIs. Output: Structured JSON with confidence scores.
- **Data-Mapping Agent:** Maps CSV/API fields to report visuals. Output: Proposed mappings for author approval.
- **Narrative Agent:** Drafts executive summaries. Output: Editable draft with hyperlinked metric sources.
- **QA Agent:** Reconciles totals, flags contradictions. Output: Warnings and pre-publish checklist.
**Rule:** Numerical calculations run through deterministic SQL/data functions, never LLM arithmetic alone.
