# Founder Evidence Dashboard Specification

**Purpose:** Give the founder one truthful operating view of whether RipoDoc is becoming a product MSPs repeatedly pay for and use. The dashboard is not customer analytics and must never expose report content, raw recipient email addresses, evidence rows, tokens, secrets, passwords, IP addresses, or audit-log payloads.

## 1. Users and access

| User | Permission | Reason |
|---|---|---|
| Workspace owner | Read the tenant’s own activation and report-cycle aggregate. | Lets a design partner validate its own outcomes without seeing other tenants. |
| Platform operator | Read aggregate program metrics and explicitly entered design-partner metadata. | Allows founder-led program decisions. |
| Administrator/author/viewer | No cross-tenant founder dashboard access. | Prevents an analytics surface from becoming a tenant-data enumeration path. |

The first implementation may retain the platform-operator view as a documented, CSV-exported operating packet rather than a live multi-tenant admin dashboard. A live operator dashboard must be role-bound, server-rendered from parameterized aggregate queries, audit-logged, and protected from tenant enumeration.

## 2. Event taxonomy

Events are names and safe metadata only. The event payload cannot include a report manifest, source rows, recipient identity, raw email, raw IP, token, secret, password, free-text client content, or browser user-agent string.

| Event | Trigger | Safe metadata | Retention / purpose |
|---|---|---|---|
| `lead_submitted` | Prospect sends founding-partner inquiry. | `source`, `company_size_band`, `reporting_tool_band`, `interest_mode`. | Demand and conversion funnel. |
| `lead_qualified` | Founder marks discovery completed and ICP fit. | `qualification_outcome`, `budget_path_band`, `source_system_band`. | Design-partner selection. |
| `design_partner_committed` | Paid scope/commitment is recorded. | `plan_band`, `report_type_band`, `commitment_months`. | Proof gate. |
| `workspace_verified` | Workspace email verification succeeds. | `activation_source`. | Onboarding step. |
| `report_started` | Author starts structured/overlay workflow. | `mode` (`structured`/`overlay`), `source_system_band`. | Time-to-first-report analysis. |
| `report_reviewed` | Reviewer makes approval/rejection decision. | `outcome`, `mode`, `review_round_band`. | Workflow friction. |
| `report_published` | Approved report becomes available. | `mode`, `report_type_band`. | Activation and cycle tracking. |
| `evidence_opened` | Recipient opens evidence after normal authorization path. | `result` (`granted`/`denied`), `element_type_band`. | Aggregate engagement only. |
| `recipient_proof_completed` | Intended recipient completes proof. | `result`. | Evidence experience usability. |
| `report_cycle_completed` | Partner confirms a defined recurring report cycle. | `cycle_number`, `report_type_band`, `outcome_band`. | Retention proof gate. |
| `partner_outcome_recorded` | Authorized partner success scorecard is entered. | `time_saved_band`, `continue_intent`, `budget_path_band`, `integration_request_band`. | PMF and pricing evidence. |
| `integration_requested` | Partner requests a source integration. | `source_system_band`, `workflow_stage`. | Connector decision rule. |

## 3. Required records

| Record | Durable fields | Prohibited fields |
|---|---|---|
| Design partner | Internal opaque ID, linked tenant ID, stage, ICP bands, source category, consent timestamps, paid-commitment state, first/last cycle date, continuation status. | Customer report content, client identities, payment-card data, raw call transcript. |
| Founder event | Opaque ID, tenant ID where relevant, event name, safe metadata, timestamp, actor role, pseudonymized request correlation if needed. | Raw recipient identity, raw evidence/JTI value, secret, token, source row. |
| Outcome scorecard | Partner ID, report type, baseline/after time bands or consented numeric fields, calculation method, cycle, qualitative category, entered-by, timestamp. | Unredacted client data or free-form sensitive content without separate controlled research storage. |
| Lead | Opaque ID, consent, secure contact reference/tenant link after account creation, source, ICP bands, stage, next action. | Publicly exposed contact details or credentials. |

## 4. Metrics

| Metric | Formula | Minimum decision threshold | Notes |
|---|---|---|---|
| Qualified discovery rate | Qualified leads ÷ submitted leads | Trend over time; no target before baseline. | Segment by source, not identity. |
| Paid partner conversion | Paid commitments ÷ qualified discovery calls | Five paid partners is the first proof gate. | Exclude unpaid pilots. |
| Time to first approved report | `report_reviewed(approved)` timestamp − `workspace_verified` timestamp | Decrease by onboarding cohort. | Compare structured vs overlay honestly. |
| First report activation | Tenants with a published report within target window ÷ verified tenants. | Benchmark after first cohort. | Requires no recipient identity. |
| Evidence proof completion | Successful recipient proof ÷ eligible proof attempts. | Track by version, not individual recipient. | Do not treat as a customer-value proxy alone. |
| Cycle completion | Partners completing cycle N ÷ activated partners. | Three cycles per partner. | Core retention evidence. |
| Preparation-time change | Consented baseline − post-RipoDoc preparation hours. | Validate direction and method before public claim. | Report both median and distribution once cohort size supports it. |
| Paid continuation | Partners continuing paid relationship ÷ partners completing scope. | Evaluate at scope completion. | Stronger than a verbal satisfaction score. |
| Budget source mix | Displacement vs additive vs unknown commitments. | Resolve before pricing publication. | Classification comes from discovery question. |
| Repeated connector signal | Partners requesting same source system ÷ paid partners. | Three paying partners request the same source. | Decision rule, not a popularity contest. |

## 5. Privacy and operational safeguards

The instrumentation must be opt-in where customer research data is collected, documented in the privacy notice, and auditable. Product events should default to aggregate product-operation analysis; outcome scorecards require a customer’s explicit agreement. Event names and metadata are schema-validated on the server, with an allowlist and bounded lengths. Client code should not be able to submit arbitrary analytics payloads. The analytics store must be tenant-scoped for tenant metrics and separately role-bound for platform aggregates.

## 6. Release acceptance tests

1. A public lead request records only schema-allowed, rate-limited data and does not leak whether a contact record already exists.
2. An unauthenticated request cannot retrieve lead, partner, tenant, event, outcome, or aggregate founder evidence data.
3. A tenant user cannot access another tenant’s evidence dashboard rows or aggregate partner data.
4. Event validation rejects unrecognized names, overlong values, raw email-looking fields, token-looking fields, and nested arbitrary payloads.
5. Each event write generates a safe audit event without copying sensitive payload data.
6. Tests prove the dashboard formula behavior from fixture records and prove zero-event/empty-state behavior.
7. Documentation defines retention, export, and deletion behavior before production collection is enabled.
