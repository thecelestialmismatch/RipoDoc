# RipoDoc Design System — Signal Ledger

> **A high-trust evidence product should feel like a well-run control room: quiet, exact, inspectable, and decisively useful.**

## 1. Visual Theme & Atmosphere

**Style:** Signal Ledger is a premium technical-editorial system. It combines mineral surfaces, deep ink, a single cobalt action signal, and layered evidence-record compositions. Public pages establish clarity and proof. Private pages establish calm operational control.

**Keywords:** composed, exact, credible, technical, calm, editorial, bounded, durable.

**Tone:** Confident and precise, not generic-AI, crypto-like, consumer-fintech, faux-enterprise, or theatrical.

**Feel:** A reviewed report page beside a secure operations console, illuminated by one cobalt verification signal.

**Design read:** RipoDoc is a trust-first B2B SaaS evidence-delivery product for MSP founders, vCIO/account-management leaders, and technical operators. It needs a premium editorial marketing experience plus an operationally dense private workspace, linked by one identity.

**Interaction tier:** L1+ — polished focus, press, disclosure, and one-time staged load-in. No scroll-jacking, cursor effects, fake activity, WebGL, pinning, or continuous decorative motion.

**Dependencies:** Existing Next.js, Tailwind CSS v4, `next/font` Geist and Geist Mono, and the installed icon package. No new runtime library is required.

## 2. Color Palette & Roles

```css
:root {
  --rd-canvas: #f4f6f8;
  --rd-canvas-alt: #eef1f5;
  --rd-surface: #ffffff;
  --rd-surface-strong: #e7ebf0;
  --rd-surface-ink: #101827;
  --rd-surface-ink-raised: #182236;

  --rd-line: #c9d1dc;
  --rd-line-strong: #9eabbc;
  --rd-line-ink: #28364d;

  --rd-ink: #101827;
  --rd-ink-soft: #4d5a6c;
  --rd-ink-faint: #718096;
  --rd-on-ink: #f7f9fc;
  --rd-on-ink-soft: #c9d5e5;

  --rd-signal: #2456e8;
  --rd-signal-hover: #193fbd;
  --rd-signal-soft: #e6ecff;
  --rd-signal-rgb: 36, 86, 232;

  --rd-success: #187455;
  --rd-success-soft: #e5f4ed;
  --rd-warning: #a46012;
  --rd-warning-soft: #fff1db;
  --rd-danger: #b23d3d;
  --rd-danger-soft: #fdeaea;

  --rd-canvas-rgb: 244, 246, 248;
  --rd-ink-rgb: 16, 24, 39;
}
```

**Color rules:**

- Cobalt is the only brand accent. It denotes primary action, active evidence relationship, or intentional navigation state.
- Green, amber, and red are reserved for truthful product state, validation, warning, or error; never decorative implication.
- Public and private surfaces share mineral canvas, ink, cobalt, and typography. Private views use more graphite contrast and data density, not a second unrelated cyan/gradient identity.
- All implementation colors use the tokens above or a documented semantic variant.

## 3. Typography Rules

```css
/* Provided by next/font in the root layout. */
font-family: var(--font-geist-sans), "Segoe UI", sans-serif;
font-family: var(--font-geist-mono), "SFMono-Regular", Consolas, monospace;
```

| Role | Font | Size | Weight | Line height | Letter spacing |
| --- | --- | ---: | ---: | ---: | ---: |
| Public hero H1 | Geist | `clamp(3rem, 7vw, 6.5rem)` | 620–700 | 0.94 | -0.07em |
| Section H2 | Geist | `clamp(2.15rem, 4vw, 4.4rem)` | 600–680 | 0.98 | -0.055em |
| Workspace H1 | Geist | `clamp(2rem, 3vw, 3.5rem)` | 650 | 1.02 | -0.045em |
| H3 / card title | Geist | 1.05–1.35rem | 600 | 1.2 | -0.025em |
| Body | Geist | 1rem | 420–460 | 1.65 | normal |
| Compact body | Geist | 0.875rem | 450–520 | 1.5 | normal |
| Evidence label | Geist Mono | 0.69–0.75rem | 650 | 1.35 | 0.1em |
| Numeric / report value | Geist Mono | context-driven | 600–700 | 1.0 | -0.045em |

**Typography rules:**

- Public display headings are specific and compact enough to occupy no more than two desktop lines in the first viewport.
- Narrative text is limited to 62 characters per line; resources to 70 characters; dashboard labels remain compact and tabular.
- Use sentence case. Reserve mono for provenance, status, controls, and actual report values.
- Use `text-wrap: balance` for display headings and `text-wrap: pretty` for long text where supported.
- **Never use:** Inter, arbitrary editorial serif pairing, artificial italics, all-caps display headings, or low-contrast thin text.

**Text decoration:** Hero display text has no gradient fill or shadow. A cobalt evidence underline or annotation may emphasize one real product term only.

## 4. Component Stylings

### Primary action

```css
.rd-button-primary {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  border: 1px solid var(--rd-signal);
  border-radius: 0.875rem;
  background: var(--rd-signal);
  box-shadow: 0 10px 25px rgba(var(--rd-signal-rgb), 0.18), inset 0 1px 0 rgba(255,255,255,0.22);
  color: #fff;
  font: 650 0.875rem/1 var(--font-geist-sans);
  transition: transform 180ms cubic-bezier(.2,.8,.2,1), background-color 180ms cubic-bezier(.2,.8,.2,1), box-shadow 180ms cubic-bezier(.2,.8,.2,1);
}
.rd-button-primary:hover { background: var(--rd-signal-hover); box-shadow: 0 14px 30px rgba(var(--rd-signal-rgb), .24), inset 0 1px 0 rgba(255,255,255,.2); transform: translateY(-1px); }
.rd-button-primary:active { transform: translateY(1px) scale(.985); box-shadow: inset 0 2px 3px rgba(0,0,0,.16); }
.rd-button-primary:focus-visible { outline: 3px solid rgba(var(--rd-signal-rgb), .32); outline-offset: 3px; }
.rd-button-primary:disabled { cursor: not-allowed; opacity: .5; transform: none; }
```

### Secondary action, link, and field

```css
.rd-button-secondary {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  border: 1px solid var(--rd-line-strong);
  border-radius: 0.875rem;
  background: var(--rd-surface);
  color: var(--rd-ink);
  font: 600 0.875rem/1 var(--font-geist-sans);
  transition: border-color 180ms cubic-bezier(.2,.8,.2,1), background-color 180ms cubic-bezier(.2,.8,.2,1), transform 180ms cubic-bezier(.2,.8,.2,1);
}
.rd-button-secondary:hover { border-color: var(--rd-signal); background: var(--rd-signal-soft); transform: translateY(-1px); }
.rd-button-secondary:active { transform: translateY(1px) scale(.985); }
.rd-button-secondary:focus-visible, .rd-link:focus-visible { outline: 3px solid rgba(var(--rd-signal-rgb), .30); outline-offset: 3px; }
.rd-link { color: var(--rd-signal); font-weight: 650; text-decoration: none; text-underline-offset: 0.24em; }
.rd-link:hover { color: var(--rd-signal-hover); text-decoration: underline; }
.rd-field { min-height: 48px; width: 100%; border: 1px solid var(--rd-line-strong); border-radius: .75rem; background: var(--rd-surface); color: var(--rd-ink); padding: .75rem .875rem; }
.rd-field:focus { border-color: var(--rd-signal); box-shadow: 0 0 0 3px rgba(var(--rd-signal-rgb), .14); outline: none; }
```

### Evidence panel, workspace card, and status

```css
.rd-evidence-panel {
  border: 1px solid var(--rd-line-strong);
  border-radius: 1.25rem;
  background: linear-gradient(145deg, rgba(255,255,255,.98), rgba(231,235,240,.92));
  box-shadow: 0 18px 42px rgba(16,24,39,.09), inset 0 1px 0 rgba(255,255,255,.8);
}
.rd-workspace-card { border: 1px solid var(--rd-line); border-radius: 1rem; background: var(--rd-surface); box-shadow: 0 8px 22px rgba(16,24,39,.055), inset 0 1px 0 rgba(255,255,255,.95); }
.rd-status { border-radius: 999px; font: 650 .6875rem/1 var(--font-geist-mono); letter-spacing: .08em; padding: .45rem .6rem; text-transform: uppercase; }
.rd-status--published { background: var(--rd-success-soft); color: var(--rd-success); }
.rd-status--review { background: var(--rd-warning-soft); color: var(--rd-warning); }
```

### Navigation

```css
.rd-nav-shell {
  position: sticky;
  top: .75rem;
  z-index: 40;
  margin: .75rem auto 0;
  max-width: min(1480px, calc(100% - 2rem));
  border: 1px solid rgba(158,171,188,.9);
  border-radius: 1rem;
  background: rgba(247,249,252,.88);
  box-shadow: 0 10px 30px rgba(16,24,39,.08);
  backdrop-filter: blur(14px);
}
.rd-nav-link { color: var(--rd-ink-soft); font-weight: 600; }
.rd-nav-link:hover, .rd-nav-link[aria-current="page"] { color: var(--rd-ink); }
.rd-nav-link[aria-current="page"]::after { background: var(--rd-signal); content: ""; display: block; height: 2px; margin-top: .35rem; width: 100%; }
```

## 5. Layout Principles

**Container rules:**

- Public: `min(1440px, calc(100% - 40px))`; 48px safe gutter at 640px; 64px at 1024px.
- Articles and policies: 760px maximum. Evidence explanations: 940px maximum.
- Workspace: `min(1520px, calc(100% - 40px))`, with a 20px mobile gutter and 32px desktop gutter.

**Spacing scale:** `4, 8, 12, 16, 24, 32, 48, 72, 104, 144px`.

Public sections use 104–144px desktop and 64–88px mobile block spacing. Workspace regions use 32–56px desktop and 24–36px mobile block spacing. Cards use 20–28px interior padding.

```css
.rd-public-split { display: grid; gap: clamp(2rem, 5vw, 6rem); grid-template-columns: minmax(0, .9fr) minmax(360px, 1.1fr); }
.rd-ledger-grid { display: grid; gap: 1px; background: var(--rd-line); grid-template-columns: repeat(12, minmax(0, 1fr)); }
.rd-resource-grid { display: grid; gap: 1rem; grid-template-columns: repeat(12, minmax(0, 1fr)); }
@media (max-width: 1023px) { .rd-public-split { grid-template-columns: 1fr; } }
@media (max-width: 767px) { .rd-resource-grid { display: block; } }
```

Public pages use a sequence of distinct layouts: evidence hero, proof rail, annotated operating record, no-data diagnostic invite, resource index, and closing evidence boundary. Do not repeat three equal feature cards or use more than two side-by-side split sections in sequence.

## 6. Depth & Elevation

| Level | Treatment | Use |
| --- | --- | --- |
| Flat | Mineral canvas with a track line | Editorial sections, resource lists, report data |
| Raised | Soft white surface, cool line, inset highlight | Inputs, utility menus, controlled panes |
| Evidence panel | Layered surface and tinted neutral shadow | Sample reports, report inspector, diagnostic steps |
| Floating | Cobalt-tinted low-opacity shadow | Navigation, cookie panel, contextual actions |
| Ink plane | Deep ink with on-ink type and one cobalt line | Workspace header, boundary panel, closing CTA |

Never use generic black shadows, blur on scrolling content, glass cards inside glass cards, or decorative elevation with no hierarchy.

## 7. Animation & Interaction

**Motion philosophy:** Motion confirms structure and user intent. It never impersonates activity, hides access conditions, or distracts from report data.

```css
@keyframes rd-reveal { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.rd-reveal { animation: rd-reveal 460ms cubic-bezier(.2,.8,.2,1) both; }
.rd-evidence-panel, .rd-workspace-card { transition: border-color 180ms cubic-bezier(.2,.8,.2,1), box-shadow 180ms cubic-bezier(.2,.8,.2,1), transform 180ms cubic-bezier(.2,.8,.2,1); }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: 1ms !important; }
}
```

The only entrance behavior is a one-time CSS reveal. Controls use transform and color feedback. No animation is required to understand content, complete a control, or receive authentication feedback.

## 8. Do's and Don'ts

### Do

- Build the public site around one inspectable promise: a client-report claim can have a controlled evidence path.
- Treat the First 15 founder request as research, not a generic SaaS lead magnet.
- Make fixture data, production boundaries, self-host posture, and reviewed-source requirements conspicuous and calm.
- Give mobile layouts the same intentional hierarchy as desktop, with no horizontal scrolling or edge-to-edge reader content.
- Use evidence rails, audit labels, and report-source patterns only when they describe real behavior.
- Use one primary conversion action per page and a clear no-data secondary resource.
- Preserve semantic HTML, keyboard focus, 48px touch targets, line length, and reduced-motion behavior.

### Don't

- ❌ Do not copy reference-repository branding, logo, copy, layout, or trade dress.
- ❌ Do not add fake customer logos, testimonials, case studies, certifications, metrics, or AI capabilities.
- ❌ Do not use a generic dark gradient, cyan glow, bento-card wall, or equal three-card feature row as a substitute for product proof.
- ❌ Do not use public-page motion in private report management or auth flows.
- ❌ Do not present RipoDoc as an RMM, PSA, SIEM, BI platform, client portal, compliance certification, or fully configured hosted workspace.
- ❌ Do not hide expiry, recipient binding, source review, no-data boundaries, or legal caveats in microcopy.
- ❌ Do not use page-level horizontal scroll, clipped button labels, `100vh` hero constraints, or touch targets below 48px.
- ❌ Do not alter authentication wording, rate limits, sessions, CSRF, Turnstile, evidence-token rules, or private-route indexing policy during visual work.
- ❌ Do not introduce analytics, tracking, or third-party visual dependencies without an explicit privacy review.

## 9. Responsive Behavior

| Name | Width | Key changes |
| --- | ---: | --- |
| Wide desktop | ≥1280px | Paired public hero and evidence pane; multi-column resource composition; workspace side inspector. |
| Desktop | 1024–1279px | Reduced public split ratio, contained navigation, workspace two-column layout where reports exist. |
| Tablet | 768–1023px | Rich sequence with stacked evidence panes; condensed navigation; stacked workspace list/inspector. |
| Mobile | <768px | 20px content gutter, one-column content, no decorative overlap, no persistent floating panel obscuring principal content, and no page-level horizontal scroll. |

**Touch targets:** 48px minimum for buttons, inputs, menu controls, and actionable rows.

**Collapsing strategy:** Multi-column public grids collapse before text becomes compressed. Workspace filters stack below 768px. Tables become labeled report rows or contained horizontal regions; the page body never scrolls horizontally. Decorative overlap is removed on mobile before content or actions are reduced.

```css
.rd-wrap { width: min(1440px, calc(100% - 40px)); margin-inline: auto; }
.rd-tool-wrap { width: min(1520px, calc(100% - 40px)); margin-inline: auto; }
@media (min-width: 640px) { .rd-wrap, .rd-tool-wrap { width: min(1440px, calc(100% - 48px)); } }
@media (min-width: 1024px) { .rd-wrap { width: min(1440px, calc(100% - 64px)); } .rd-tool-wrap { width: min(1520px, calc(100% - 64px)); } }
@media (max-width: 767px) { .rd-hide-mobile { display: none; } .rd-mobile-stack { grid-template-columns: 1fr !important; } }
```
