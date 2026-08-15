# Responsive Fix Inspection

**Target:** RipoDoc interactive claim sample and global footer  
**Environment:** Local Next.js app, activated `Tickets resolved` evidence panel

| Viewport | Horizontal overflow | Evidence-panel placement | Footer brand check |
| --- | --- | --- | --- |
| Mobile — 390px | None: `scrollWidth = clientWidth = 390` | Detail begins after the report (`742px` after report bottom at `726px`), creating a straight vertical flow. | Footer contains `RipoDoc`; computed wordmark color is `rgb(255, 253, 248)` on the dark footer. |
| Tablet — 768px | None: `scrollWidth = clientWidth = 768` | Detail begins after the report (`632px` after report bottom at `616px`), preserving the vertical flow. | Footer contains `RipoDoc`; computed wordmark color is `rgb(255, 253, 248)`. |
| Wide desktop — 1600px | None: `scrollWidth = clientWidth = 1590` | Report and active evidence detail begin at the same vertical position, preserving the intended wide-screen side-by-side experience. | Footer contains `RipoDoc`; computed wordmark color is `rgb(255, 253, 248)`. |

## Implementation result

The sample detail layout now waits until the `2xl` breakpoint to compose side by side. Mobile evidence rows use semantic, vertically stacked label/value cards instead of an overflowable data table. Mobile controls wrap and receive practical touch heights. The footer uses the same RipoDoc icon and wordmark component with an explicit inverse treatment, so the full brand name remains visible on the dark footer surface.

The essential-cookie notice is intentionally dismissible and may initially occupy a portion of a phone viewport; it is not a horizontal layout dependency and it does not prevent a visitor from closing or acknowledging the notice before using the demo.
