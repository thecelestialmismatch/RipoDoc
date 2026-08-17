# RipoDoc Design Resources

## Installed reusable skills

| Resource | Location | Intended RipoDoc use | Boundary |
| --- | --- | --- | --- |
| Taste Skill: design-taste-frontend | `.agents/skills/design-taste-frontend/` | Public marketing pages, editorial resources, and landing-page redesign audits. | The source explicitly excludes dashboards, data tables, and multi-step product UI. Do not apply it blindly to authenticated tooling. |
| Taste Skill: redesign-existing-projects | `.agents/skills/redesign-existing-projects/` | Audit-first improvements to existing RipoDoc marketing routes. | Preserve public URLs, product claims, accessibility, and conversion semantics unless a release explicitly changes them. |
| Taste Skill: high-end-visual-design | `.agents/skills/high-end-visual-design/` | Component-level polish after an approved RipoDoc design direction exists. | Must remain subordinate to the Ledger Edition brand system and performance/accessibility requirements. |
| Xiaopu web-design | `/home/ubuntu/design-references/web-design/` | Produce an explicit `DESIGN.md` specification before a substantial visual redesign. | Use its spec-first flow and responsive audit; do not treat its compulsory animation or placeholder-image rules as overriding RipoDoc’s actual assets, reduced-motion behavior, or performance budget. |
| VoltAgent awesome-design-md | `/home/ubuntu/design-references/awesome-design-md/` | Compare discrete public design-system patterns and choose an explicit reference direction. | Use as inspiration and analysis only. Do not copy a third party’s branding, trade dress, visual identity, assets, or copyrighted copy. |

## RipoDoc design read

RipoDoc is a **trust-first B2B SaaS and evidence-delivery product for MSP reporting teams**. Its established Ledger Edition is a warm-paper, ink, cobalt, restrained-red editorial system with sharp geometry, visible operating boundaries, and a strong readable evidence aesthetic. Public pages should favor serious product clarity over visual spectacle. Authenticated dashboard and evidence surfaces should favor readable data, durable controls, and task completion over marketing-page motion.

## Required workflow for a future major design change

1. Write a one-line design read that identifies page type, audience, trust/compliance boundary, and whether the page is marketing, editorial, or authenticated product UI.
2. Use the Xiaopu process to create or revise a project-level `DESIGN.md` before major visual refactors. The existing Ledger Edition tokens, visual evidence, and responsive contract are the dominant inputs.
3. Use a small, explicitly named set of VoltAgent reference patterns only after checking that the borrowed patterns are compatible with RipoDoc’s existing brand and do not imitate a third party’s identity.
4. Apply Taste Skill’s audit-first and anti-generic guidance selectively to public marketing routes. Use its accessibility, responsive-layout, CTA, and anti-default recommendations; reject any instruction that conflicts with actual product needs, evidence accuracy, performance, or RipoDoc’s current production constraints.
5. Retain strict typecheck, responsive geometry assertions, real browser visual review, and `npm run verify && npm run lint` before release.

## Non-negotiable RipoDoc guardrails

- Preserve real product claims and fixture-data labels. Never invent customer logos, adoption metrics, certifications, case studies, or product capabilities.
- Do not introduce unreviewed third-party packages, animation libraries, remote assets, or tracking merely to match a reference.
- Public routes require mobile-safe gutters, no horizontal scrolling, keyboard access, sensible focus states, reduced-motion support where motion exists, and a documented responsive collapse for every multi-column section.
- The hosted workspace intentionally fails closed until its production release gate is satisfied. Design changes must not imply otherwise.
- The current shared Ledger Edition brand system remains the default until an approved `DESIGN.md` replacement is designed, reviewed, tested, and released.
