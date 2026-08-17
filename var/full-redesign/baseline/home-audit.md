# RipoDoc Full Redesign — Homepage Baseline Audit

Captured 2026-08-17 from the local Next.js route at `390×900` and `1440×900`, both at 2× device scale.

## Observed strengths

The existing home page has a distinctive evidence-led premise, visible brand mark, crisp claim language, and an actual fixture-data interaction rather than a fabricated product screenshot. The primary action and sample evidence surface are visible above the fold on desktop. The existing warm paper, document grid, stamp, and ink system establishes a recognizable starting point.

## Redesign findings

| Area | Finding | Redesign implication |
| --- | --- | --- |
| Hero hierarchy | The desktop hero is split between a large statement and a dense sample-report panel, but the headline appears partially hidden below the cookie notice at first render. | Recompose the hero so the value statement, product visual, and consent experience coexist without hiding the principal message. The consent interface must remain compliant but compact and non-obstructive. |
| Mobile first viewport | The mobile hero has strong type but consumes most of the screen before a product visual or immediate proof moment appears. Repeated boxed labels and the large stamp compete with the primary claim. | Establish a compact evidence cue or product preview in the first viewport and reduce decorative micro-label competition. |
| Visual system | The current document-grid, hard borders, and boxed controls are coherent but overused. They make much of the page feel like a single flat treatment rather than a deliberate sequence of distinct moments. | Retain the evidence-record idea but rebuild it into a more differentiated system of ledger rails, document layers, provenance marks, soft depth, and editorial pacing. |
| Conversion clarity | “Inspect a sample claim” is clear, but the secondary readiness check competes at the same visual weight. The founder-discovery diagnostic is not the hero’s primary audience path. | Lead with a clearly qualified MSP diagnostic path while retaining a friction-free sample and no-data readiness resource as trust-building secondary actions. |
| Trust boundary | The fixture-data label is present, but the claim that public pages do not collect report data needs a more prominent and elegant trust cue near primary conversion. | Turn the no-data boundary, implementation reality, and evidence-review workflow into first-class proof architecture rather than footer-like caveats. |

## Design read

**Reading this as:** a trust-first B2B SaaS evidence-delivery platform for MSP owners and client-reporting leaders, with an editorial operating-record language, premium restrained motion, and a deliberately human evidence workflow rather than generic AI or dashboard aesthetics.

The full redesign should use medium layout variance, low-to-moderate motion, and practical data density. It must preserve the existing public product boundary: RipoDoc is a narrow controlled-evidence layer, not an RMM, PSA, BI platform, client portal, broad compliance system, or production-hosted intake endpoint.

## MSP conversion and secure-entry findings

| Surface | Baseline finding | Redesign requirement |
| --- | --- | --- |
| For MSPs desktop | The page has a focused QBR message and credible five-minute report teardown, but repeats the same grid, hard-border, and stamp vocabulary as the home page. The cookie notice blocks the first conversion path and the page treats two actions with near-equal weight. | Reframe as a diagnostic invitation built around the founder-discovery qualification: one challenged report claim, one reviewed source, a named report owner, and a small paid diagnostic decision. Keep the no-data resource visible as an alternative, not a competing primary conversion. |
| Public navigation | The current navigation is functionally clear but presents six equally weighted links and a strong CTA in a rigid utility bar. | Build a more intentional information architecture: one principal conversion action, grouped educational/trust navigation, and an unobtrusive responsive mobile route menu. |
| Secure sign-in mobile | The dedicated workspace entry surface is visually distinct and readable, but it currently feels like a separate product because its dark, cyan-gradient system is disconnected from the public paper-led brand. | Rebuild shared brand cues, typography, data-boundary language, and input interaction states so secure entry feels like the private side of the same evidence product. Retain the security messaging, generic response behavior, and authentication mechanics unchanged. |

## Initial IA direction

1. **Home:** Establish the product category and prove the core interaction immediately with fixture data.
2. **For MSPs:** Qualify an evidence-diagnostic conversation using the First 15 discovery criteria; do not promise a generic reporting platform.
3. **Method:** Make the claim-to-source-to-reader operating record inspectable.
4. **Resources:** Group readiness, canonical QBR guide, security, legal, self-host, and open-source inspection into a coherent knowledge architecture.
5. **Workspace:** Treat authentication, dashboard, upload, and evidence surfaces as one private operating environment with a calmer, purpose-built utility system.

## Cookie-notice design constraint

The existing consent choice is required. The redesign must preserve equal Accept, Reject, and Settings options and no optional preselection, but change the initial presentation so it does not cover the page’s principal statement or sample interaction at standard desktop and phone sizes.

## Private-workspace baseline findings

The existing dashboard has solid functional architecture: tenant-scoped report registry, search and client filters, selected-report inspector, explicit workspace boundary, composed empty state, and clear secure-manifest behavior. These must be preserved. Its visual system is a generic blue/cyan rounded-card SaaS interface that does not share the public evidence-record identity; it should be replaced rather than lightly restyled.

The private redesign should introduce a compact **Evidence Ledger** workspace shell: a muted graphite data canvas, restrained cobalt action color, practical table/report hierarchy, a fixed mobile-safe utility header, readable empty/filter/error states, and one operational primary action. It should not apply marketing-page stamps, decorative grids, high-motion effects, or long sales copy to report management. Authentication and dashboard surfaces will share typography and brand provenance marks with the public site, but will use denser components and lower motion intensity.
