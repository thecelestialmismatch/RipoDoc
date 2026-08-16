# For MSPs Responsive Baseline Inspection

**Captured:** 2026-08-16
**Route:** `/for-msps`
**Local baseline:** `http://localhost:3100/for-msps`

## Initial visual findings

| Viewport | Observation | Risk | Planned correction |
| --- | --- | --- | --- |
| 320 × 568, portrait | The large mobile heading is necessarily multi-line, but the hero begins with a cramped kicker line and the desktop-offset shadow is likely to consume too much of the narrow visual frame once the aside comes into view. The hero uses desktop-scale spacing before a reader reaches the key action. | The first impression feels wider and less deliberate than the phone viewport permits. | Introduce a compact narrow-phone layout, bounded heading measure, responsive hero gutter, and a smaller mobile panel offset. |
| 1440 × 900, desktop | The hero has a substantial visual gap between the text column and the aside; the right aside visually dominates while the left narrative stops well short of its grid column. The current 1.15:0.85 ratio does not closely match either block’s content measure. | The hero feels loosely composed rather than intentionally paired. | Use a slightly more balanced, constrained two-column ratio; cap the readable text measure; align the aside vertically and reserve its shadow clearance. |

## Areas requiring responsive review

1. The hero should stack safely from 320 px through 1023 px and use a balanced paired layout only where both columns have enough room.
2. The five-step list, FAQ list, and operating sequence should shift from one column to three semantic columns only when their text measures remain readable.
3. The three feature cards should not feel compressed at the tablet breakpoint.
4. The blue diagnostic call to action must retain a full-width, touch-friendly action on narrow screens and a stable CTA rail at wider widths.
5. No layout may create horizontal overflow in portrait or landscape orientation.

## Post-change verification: phone portrait and desktop

| Viewport | Result | Evidence |
| --- | --- | --- |
| 320 × 568, portrait | **Pass.** The hero now has a visible 16 px reading gutter, the kicker wraps without clipping, the display type has a controlled mobile measure, and the body copy no longer begins against the viewport edge. | `after-phone-se-2x.png` |
| 1440 × 900, desktop | **Pass.** The hero now uses a restrained 1.08:0.92 paired grid inside an 84rem content measure. The narrative and teardown panel are optically balanced, and the blue panel offset has deliberate clearance. | `after-desktop-2x.png` |

The revised implementation also moves feature-card density, operating-sequence rows, and FAQ columns to larger breakpoints, preventing compressed multi-column text at intermediate widths. The CTA becomes a full-width touch target when it stacks.

## Post-change verification: orientation-specific layouts

| Viewport | Result | Evidence |
| --- | --- | --- |
| 844 × 390, phone landscape | **Pass.** The page remains in the compact single-column state until the true desktop threshold, preserving a readable full-width hero rather than forcing a cramped two-column split on a short rotated screen. | `after-phone-landscape-2x.png` |
| 1024 × 768, tablet landscape | **Pass.** The paired hero begins only at this width and retains wide, readable text columns. The teardown panel has its own protected grid track; no element is visibly clipped or proportionally collapsed. | `after-tablet-landscape-2x.png` |

The local browser’s consent notice may cover lower hero content in a fresh profile. It is a fixed, intentional consent UI rather than a page-layout overflow. The underlying content remains balanced and the top-level geometry is visible above it.

## Objective geometry assertions

A Chrome DevTools Protocol check loaded the local route at six representative device sizes and inspected `documentElement.scrollWidth`, `body.scrollWidth`, and the bounds of key page elements.

| Target viewport | Document width | Horizontal scroll | Escaped elements | Result |
| --- | ---: | --- | --- | --- |
| 320 × 568, phone portrait | 320 | No | None | Pass |
| 390 × 844, phone portrait | 390 | No | None | Pass |
| 844 × 390, phone landscape | 844 | No | None | Pass |
| 768 × 1024, tablet portrait | 768 | No | None | Pass |
| 1024 × 768, tablet landscape | 1024 | No | None | Pass |
| 1440 × 900, desktop | 1440 | No | None | Pass |

The machine-readable assertion output is recorded in `responsive-geometry.json`. The test first stores a local rejected-cookie preference so the intentional consent UI cannot affect the page-geometry measurement.
