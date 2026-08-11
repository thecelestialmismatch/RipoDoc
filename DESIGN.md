# RipoDoc Design System

## Product personality

RipoDoc is **evidence that is easy to inspect**. The visual language should feel credible to managed service providers and reassuring to the client recipients of their reports: precise, capable, modern, and calm. The public site should lead with a decisive business outcome and immediately show trustworthy product evidence, not generic SaaS decoration.

## Visual direction

Use a light editorial surface with a navy-to-teal technical atmosphere. The hero may use an asymmetric teal radial field and a fine grid at low opacity. Product proof should be rendered as structured report and evidence-workspace surfaces, never as fake dashboards full of unverifiable metrics.

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#11162E` | Primary headings, navigation, key text |
| Ink muted | `#46526A` | Supporting copy |
| Blue | `#1769E8` | Primary action, interactive emphasis |
| Blue deep | `#0A3E9B` | Pressed states, dark surfaces |
| Teal | `#12B9BE` | Brand gradient, live/proof signals |
| Teal pale | `#DDF9F7` | Soft supporting backgrounds |
| Sky | `#EAF5FF` | Light utility surfaces |
| Mist | `#F6F8FC` | Page background |
| Line | `#DCE4F0` | Rules and subtle separation |
| Success | `#078C68` | Confirmed/verified state |

## Typography

Use the configured Geist sans family. Headings are tight, highly legible, and weighted at 650–750. Display headlines should use a 1.02–1.08 line height, with blue-to-teal emphasis reserved for a single decisive phrase. Body copy should remain comfortably readable at 16–18px with a 1.55–1.7 line height. Use mono typography only for product artefacts such as commands, report identifiers, and audit-verification examples.

## Layout

The standard page frame is a `max-w-7xl` centered content container with 24px mobile and 40px desktop inset. Use spacious horizontal compositions above tablet width; stack deliberately on mobile. Public page sections should alternate between open editorial whitespace, report-proof surfaces, and compact structured grids. Avoid a sequence of visually identical cards.

## Components and interaction

Primary actions use a blue-to-teal gradient with navy text or white text only where contrast passes. Secondary actions have a white surface, navy text, and a subtle border. Cards use 16–24px radius, soft shadows, and a thin cool-gray border. Navigation stays white/translucent with a compact logo lockup. All interactive controls require clear focus rings and 44px touch targets where feasible.

Use short opacity and transform transitions only, capped at 220ms. Respect `prefers-reduced-motion`; animations are decorative, never required to understand the interface.

## Responsive behavior

At `md`, public navigation collapses to a menu. At `lg`, two-column hero and product-proof panels are allowed. Dense tables must expose horizontal scrolling rather than clipping content. Product proof sections should present their core outcome before optional detail.

## Do not

Do not use purple as a primary brand color. Do not add fake customer logos, fake testimonials, pricing claims, compliance certifications, or unsupported quantitative results. Do not treat a public report link as inherently secure: wording must reflect recipient binding, expiry, revocation, and auditable access. Do not use oversized gradients without a clear reading surface for text.
