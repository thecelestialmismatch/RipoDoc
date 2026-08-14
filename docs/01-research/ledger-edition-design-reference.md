# Ledger Edition: Distinct Public Experience Direction

**Date:** 2026-08-14  
**Decision:** Replace the proof-canvas presentation language for the new release with a distinct **Ledger Edition** system: an editorial, printed-record aesthetic built around claim cards, source stamps, side notes, index numbers, and deliberate empty space.

## Why a different direction is warranted

The current proof-canvas system uses a dark navy field, teal/blue accents, evidence rails, and a report-inspection metaphor. It is coherent, but a new release should not become a sequence of dark SaaS panels. Ledger Edition treats the report as an **accountable record** rather than a software surface: warmer, more tactile, more editorial, and more immediately ownable.

The system will not copy any external brand, visual asset, claim, typography, or interaction. Reference review identified two useful patterns: HoundShield presents a direct, ownable deployment boundary and makes the operational trade-off visible; Provenance makes claims, methodology, and structured information central to the product narrative.[1] [2] RipoDoc will translate those lessons into its own vocabulary: **claim, source, scope, reader, review**.

| Existing proof-canvas | New Ledger Edition |
| --- | --- |
| Dark navy grid and evidence rail | Warm paper field with black editorial rules and cobalt/red source stamps |
| Technical dashboard/report surface | Claim register, printed annotation, provenance index and review margin |
| Teal/blue product palette | Ink black, paper cream, archive red, cobalt blue and sparse signal yellow |
| “Inspect evidence” narrative | “Make a claim you can stand behind” narrative |
| Floating SaaS panels | Composed editorial spreads, ledger tables, side notes and physical tabs |

## Design vocabulary

The new visual language should make a reader feel like they are opening a carefully reviewed briefing packet, not visiting another generic B2B landing page.

| Element | Implementation |
| --- | --- |
| Paper field | Warm `#f6f0e5` and off-white page surfaces with a subtle paper grain/print-line treatment rendered in CSS. |
| Ink | Near-black `#1d1a16` for primary type, rules and section numbering. |
| Archive red | `#de503a` for a claim marker, status underline, and the primary action—not for every interface state. |
| Cobalt | `#3855b5` for secondary utility, source markers, and linked evidence moments. |
| Signal yellow | `#f3d968` only for a reviewed/attention stamp. |
| Typography | Large, compact editorial serif display headings paired with a precise sans-serif body; use resilient system fallbacks unless a bundled font is approved. |
| Composition | Asymmetrical editorial grids, full-bleed number fields, vertical register labels, outline tabs, and enough negative space for claims to land. |
| Motion | Small, reduced-motion-safe underline, tab, and marker transitions only. The experience must remain useful without animation. |

## Page architecture

The homepage will become a five-part argument rather than a conventional feature stack:

1. **Claim cover:** A direct declaration that a client report should make room for the question behind a metric, supported by a register-style interactive report fragment.
2. **The failure of “just send a spreadsheet”:** A stark comparison between an unbounded export and an approved evidence path.
3. **The five-field claim record:** Claim, source, scope, reader and review displayed as a printable register—not five generic benefit cards.
4. **The report moment:** A quiet, high-fidelity report spread that foregrounds the familiar PDF and shows evidence as an adjacent margin note, not a new portal.
5. **The route to operation:** Clear choice between inspecting the method, self-hosting, and a diagnostic; no fabricated proof, logos, pricing, or urgency copy.

Security, self-hosting, founding-partner, legal, method, and readiness pages will inherit the new palette and typographic grammar while retaining their factual content and fail-closed language.

## Non-negotiable truths

The redesign must preserve all existing product boundaries. It must not claim that a hosted workspace is enabled, that RipoDoc is certified or compliant with any framework, that it can prove arbitrary PDF charts, or that an AI platform will promote it. Discoverability work remains focused on original, structured, useful information that can be crawled, understood, and cited when relevant.

## References

[1]: https://www.houndshield.com/ "HoundShield public product site"
[2]: https://www.provenance.org/ "Provenance public product site"
