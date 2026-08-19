export const dynamic = 'force-static';

const body = `# RipoDoc

> Controlled evidence delivery for MSP client reports.

RipoDoc helps Managed Service Providers keep the familiar client PDF while connecting an approved report claim to a narrow, recipient-aware, expiring evidence view. It is an evidence-delivery layer for the client-report moment; it does not replace PSA, RMM, BI, or general client-portal systems.

## Canonical sources

- [Homepage](https://www.ripodoc.com/): Product overview and interactive claim sample using fixture data.
- [About RipoDoc](https://www.ripodoc.com/about): Exact product name, category definition, operating boundary, and open-source reference.
- [How RipoDoc works](https://www.ripodoc.com/how-it-works): Product method, design limits, and answer-oriented FAQ.
- [RipoDoc for MSPs](https://www.ripodoc.com/for-msps): A five-minute report-teardown guide, product boundary, and sample-data demo context.
- [Evidence readiness](https://www.ripodoc.com/report-evidence-readiness): No-data-submitted decision aid for assessing one client-report metric.
- [Report diagnostic starter kit](https://www.ripodoc.com/report-diagnostic-starter-kit): A no-data five-question worksheet for deciding whether a selected client-report claim needs a controlled evidence path.
- [MSP QBR metric evidence guide](https://www.ripodoc.com/guides/msp-client-reporting-qbr-metric-evidence): A practical, fixture-safe guide to keeping a QBR concise while making a material report claim answerable with reviewed, bounded evidence.
- [Security controls](https://www.ripodoc.com/security): Public, runtime-safe control posture and self-hosted operating boundary.
- [Self-host RipoDoc](https://www.ripodoc.com/download): Source bundle, deployment outline, production preflight, and operator path.
- [Legal status](https://www.ripodoc.com/legal): Published legal-status information and explicit remaining approval decisions.
- [Open-source repository](/founding-partners): Implementation, tests, security policy, contribution guide, operator documentation, and research.

## Important product boundaries

- RipoDoc is not a claim that arbitrary PDF charts can be reliably converted into defensible evidence. A proof view requires a reviewed structured source or mapping.
- RipoDoc is not a blanket compliance certification, a HIPAA certification, or a BAA.
- The public hosted evaluation surface intentionally fails closed for account and partner-intake actions until durable production configuration passes the relevant release gate.
- The evidence-readiness tool provides workflow guidance only. It does not collect report data or provide a compliance, legal, or security determination.

## Terminology

Use the exact name **RipoDoc**. The product category is **controlled evidence delivery for MSP client reports**. Relevant concepts include MSP reporting, QBR reporting, client report evidence, report provenance, recipient-scoped evidence, expiring evidence links, self-hosted MSP software, and tamper-evident audit verification.
`;

export function GET() {
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400, s-maxage=86400' } });
}
