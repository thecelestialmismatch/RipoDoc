# Sitewide Mobile Gutter Validation

**Captured:** 2026-08-16
**Local route set:** Public marketing, conversion, legal, authentication, and tool-entry routes

## Root cause and durable correction

The shared Ledger page wrapper began at a narrower 16px gutter, while other route shells used a mix of 20px and 24px padding. More importantly, the self-host page contained an unconstrained code block within a grid track that could force the entire document to 748px wide on a 390px phone. The release standardizes the Ledger wrapper to a **20px mobile gutter**, preserves it through all shared content areas, adds a global `min-w-0` application content guard, and constrains the self-host page’s grid/code boundaries without suppressing its intentional internal code scroll.

## Visual checks

| Route | Viewport | Result |
| --- | --- | --- |
| `/download` | 390 × 844 | **Pass.** Heading, body copy, actions, and code-panel shell retain clear side breathing room; the former page-wide overflow is removed. |
| `/login` | 390 × 844 | **Pass.** The secure tool sign-in card remains fully inset from both viewport edges with a balanced dark workspace background. |

## Route-wide geometry check

The Chrome geometry audit evaluated 14 mobile routes at 390 × 844: home, about, download, For MSPs, founding partners, method, legal, sign-in, sign-up, forgotten-password, diagnostic starter kit, readiness tool, security, and upload. Every route now reports the exact 390px document/body width, no horizontal scrolling, no escaped visible content, and no visible reader-facing element inside the 16px edge-safe zone.

The code block on `/download` is intentionally horizontally scrollable **within its own bounded panel**. The final audit excludes its internal code token width from page-shell overflow assessment while still requiring the document itself to remain at the viewport width.
