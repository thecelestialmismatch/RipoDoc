# RipoDoc Design System — Proof Theatre

## Purpose

RipoDoc is a controlled evidence-delivery layer for MSP client-report moments. The experience must make a visitor feel that a report claim is about to be **opened deliberately**, not that they are entering a generic portal, security dashboard, or AI product.

> **Primary motto:** From report to reality.  
> **Supporting motto:** The proof is in the report.

## Core metaphor

The public narrative follows a three-act structure: **the report creates a question; reviewed evidence opens behind the claim; the answer is delivered to a deliberate reader**. This is a storytelling framework, not a claim that every report is automatically interpreted or proven.

The private workspace extends the metaphor as **Act IV: operations**. It remains information-dense, tenant-scoped, and functional; visual staging must never obscure report status, actions, or security boundaries.

## Identity

The **Stage R** evolves RipoDoc’s existing R idea. It is an R-shaped opening frame with a circular spotlight cut-out and an opening line through the leg. The production asset is `web/frontend/public/proof-theatre-mark.png` and the reusable lockup is `src/components/BrandLockup.tsx`.

Use the exact HTML wordmark for accessible, precise RipoDoc typography. Do not rely on generated wordmark text in images. The logo mark is a supporting symbol, not a compliance seal, padlock, shield, or generic AI glyph.

## Palette

| Role | Token | Hex | Use |
| --- | --- | --- | --- |
| Curtain red | `--stage-red` | `#e8442e` | Public hero, act moments, primary action surfaces |
| Stage ink | `--stage-ink` | `#141111` | Type, navigation actions, evidence scenes, private control surfaces |
| Program cream | `--stage-cream` | `#f8f0df` | Primary light surface, inverse text, stage-card highlights |
| Warm paper | `--surface` | `#fff9ef` | Forms, data details, controlled reading areas |
| House pink | `--stage-pink` | `#ff9b88` | Small inverse emphasis, kicker accents, not primary body copy |
| Decision red | `--primary-deep` | `#b52e20` | Supporting headings and focused utility moments |

## Typography and layout

Use **Geist** with large, heavily weighted display type and tight negative tracking. Treat type as the stage itself: headlines may crop at desktop scale, but vital copy and actions must stay fully visible at every viewport.

The desktop composition favors asymmetry, open stage space, framed evidence scenes, program strips, and explicit act labels. Mobile collapses into poster-like reading moments with at least a **20 px content gutter**, no unintentional horizontal overflow, and a direct path to core actions.

## Components

| Primitive | Behavior |
| --- | --- |
| Act navigation | Shows a concise, route-preserving product story on desktop; collapses into a clear mobile menu. |
| Evidence scene | A black, cream, and red reveal surface for interactive report material; preserve real labels and controls. |
| Program strip | A compact sequence of report, evidence, delivery, and control; use for orientation, not filler. |
| Stage button | Hard-edged, high-contrast action; use one clear primary action per visual field. |
| Legal status surface | Red status header plus cream content; keep all factual and pending-decision language intact. |
| Workspace command center | Dense, rectangular operational surface. Tenant isolation, status, and data controls must remain obvious. |

## Interaction and accessibility

Use transitions only for color and small transforms, at or below 160 ms. Maintain visible focus outlines, keyboard-reachable navigation, actual text in the DOM, and reduced-motion support. Do not make a physical “curtain” animation mandatory for comprehension or access.

## Never do

Do not replace factual product boundaries with theatrical language. Do not claim certifications, compliance, active hosted availability, universal PDF extraction, automatic data interpretation, or endorsement by external AI/search systems. Do not introduce rounded-card-heavy SaaS layouts, neon cyber aesthetics, fake dashboards, stock compliance badges, or decorative motion that hides the report workflow.
