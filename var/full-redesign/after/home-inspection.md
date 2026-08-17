# Signal Ledger homepage inspection

**Routes reviewed:** `/` at 390×844 and 1440×900; Chromium screenshots at 2× density.

## Findings

The redesigned homepage preserves the existing RipoDoc symbol and wordmark in the navigation while giving it much stronger protected space and contrast. The Signal Ledger hero establishes a distinct premium, evidence-first visual language: dark analytical canvas, editorial display type, cobalt signal accent, and a single original provenance visual rather than generic SaaS decoration.

At 390px, navigation sits inside a protected rounded shell, the headline breaks cleanly, calls to action stack at full usable width, and the hero maintains side gutters without visible horizontal overflow. At 1440px, the content/artwork split is balanced, the primary and secondary actions stay legible, and the original hero asset supports rather than competes with the core claim.

The cookie notice appears over the first desktop capture by design because no preference had been recorded in the fresh browser profile. It is a consent-state condition, not a page overflow or layout defect. Subsequent route geometry checks will evaluate content dimensions independently of the notice.

## Decision

The homepage passes the initial premium-hierarchy and responsive-gutter visual review. Continue with MSP, secure authentication, authoring, and full geometry validation.

## MSP route review

**Routes reviewed:** `/for-msps` at 390×844 and 1440×900; Chromium screenshots at 2× density.

The MSP route now uses the First 15 discovery wedge instead of broad reporting-software language. It asks the visitor to begin with a challenged report claim, gives a no-data diagnostic path, and states the hosted fail-closed boundary without burying it.

At phone width, the headline, narrative, and two actions keep a consistent 20px content gutter with no screen-edge collision. At desktop width, the preserved safe grid contract produces a useful editorial split: concise buyer-facing claim on the left and a five-minute teardown sequence on the right. The existing logo remains unchanged. The fresh-profile cookie notice overlaps the lower left of the desktop capture, but it does not affect hero-grid width or content containment.

**Decision:** MSP visual, positioning, and responsive-contract review passes. Preserve the current grid contracts in regression coverage.

## Private workspace review

**Routes reviewed:** `/login` at 390×844 and `/upload` at 1440×900; Chromium screenshots at 2× density.

The private header preserves the original RipoDoc mark but removes public-marketing navigation from authentication and authoring contexts. The sign-in form has clear field contrast, comfortable protected margins, full touch-safe primary action, and a distinct private-workspace state.

The self-hosted authoring route retains the actual manifest → PDF → human-review → publish workflow while moving it into the same dark Signal Ledger trust frame. The original logo is used unchanged, including its inverse treatment against the dark authoring hero. Review-before-publish remains prominent.

**Decision:** private entry and authoring visual review passes for the captured states. Complete route-wide geometry, build, accessibility, and search-surface checks before publication.
