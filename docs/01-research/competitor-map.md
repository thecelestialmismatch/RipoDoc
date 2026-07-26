# Competitor Map — RipoDoc

**Retrieval date: 2026-07-26.** Source strength tags defined in [market-evidence.md](./market-evidence.md).

This file replaces `IDEA.md` §6, which omitted five real competitors — including one shipping a near-identical product at 1/10th the proposed price.

---

## The one that matters most: Handover

**[gethandover.uk](https://gethandover.uk/)** — not mentioned anywhere in `IDEA.md`.

| Attribute | Detail |
| :--- | :--- |
| What it is | Purpose-built client reporting for MSPs. Connects to the PSA, generates client updates, sends them automatically. |
| Integrations | **HaloPSA** (Technology Alliance Partner marketplace) and **ConnectWise Manage** (ConnectWise marketplace) — native API, reads live ticket and project data |
| Output | Narrative status reports, action logs, risk registers, **QBR packs with executive summary + PowerPoint + Excel in under 60 seconds**, client emails |
| Scheduling | Weekly / fortnightly / monthly automated delivery |
| Write-back | Pushes report notes back into PSA tickets |
| Price | **£49/mo Starter · £99/mo Growth**, unlimited users within the MSP |
| Positions against | BrightGauge (dashboards), MSPBots (ops automation), ChatGPT/Copilot (generic AI), manual reporting |
| Reader-facing interactivity | **None found.** Output is documents — PowerPoint, Excel, email. No clickable underlying data. |

### Why this is the most important finding in the competitive set

1. **It already occupies the narrative-report position** `IDEA.md` treats as unclaimed.
2. **It is already on both marketplaces** that `IDEA.md:240` reserves as a Month-12+ channel. The distribution advantage RipoDoc plans to earn later, Handover has now.
3. **It prices at £49–£99** against RipoDoc's proposed $750–$2,500. Any prospect who has seen Handover will anchor there.
4. **It has the gap RipoDoc is built for.** No interactive evidence layer, no review queue, no recipient-bound delivery, no audit trail. Handover automates *writing the report*. RipoDoc's claim must be about *what happens after the report is sent*.

**Implication:** Handover is not only a competitor, it is a **potential integration partner and the sharpest possible discovery question**: *"You already automate the report. What happens when your client disagrees with a number in it?"*

---

## Direct competitors — MSP-specific reporting

| Competitor | What it is | Price | Reader sees underlying rows? | Weakness vs RipoDoc |
| :--- | :--- | :--- | :--- | :--- |
| **MSPBots** | MSP BI platform; 80+ tool integrations; 1,000+ prebuilt widgets; public dashboard links | $179/mo | **Yes** — detail grids with export ship in the public report | Public link is **unauthenticated, not recipient-bound, no visible expiry or revocation**. Dashboard, not document. No review gate before client sees data. See [mspbots-teardown.md](./mspbots-teardown.md). |
| **BrightGauge** (now **ConnectWise Reports and Dashboards**) | Dashboard/KPI builder, 30+ integrations, unlimited viewer licences | $316/mo Standard · $436/mo Enterprise | Partially — gauge-level, dashboard-shaped | Requires configuration effort. Dashboard, not narrative. Public gauges/dashboards are an Enterprise feature. |
| **ScalePad Cognition360** | BI/reporting for ConnectWise PSA; ML/predictive analytics; operational, financial and executive reporting | **from $449/mo** + a Power BI licence per active user | Via Power BI (see §"Adjacent" below) | ConnectWise-only. Power BI licensing overhead. Aimed at MSP *internal* management, not the client-facing artifact. |
| **ScalePad Lifecycle Insights / Lifecycle Manager X** | QBR and vCIO tooling — consolidates assets, users, contracts, projects into client-ready reports; goals, budgets, assessments, meetings | Not published | Not established | The **incumbent in QBR reporting**. Acquisition-consolidated and PE-backed. |
| **CloudRadial** | White-labelled client portal: ticketing, service catalogue, documentation, compliance, **vCIO/QBR automation**, real-time reporting, client intranet. Replatformed 2025 around ServiceAI + ChatAI + Unified Client Portal. | Flat subscription, not published | Portal-shaped, not document-shaped | Client must log into a portal. Portal ≠ document. But it owns the client-relationship surface RipoDoc wants to reach. |
| **Handover** | See above | £49–£99/mo | No | See above |

### ScalePad is the strategic threat, not MSPBots

`IDEA.md` frames MSPBots as the competitor to beat. The evidence says otherwise. ScalePad is **rolling up this exact category**:

| Acquisition | Date | What it bought |
| :--- | :--- | :--- |
| Backup Radar | late 2021 | Backup monitoring |
| **Cognition360** | Feb 2023 | MSP business intelligence / ConnectWise data warehouse |
| ControlMap | 2023 | Compliance |
| **Lifecycle Insights** | Apr 2023 | **QBR, customer success, vCIO** |

Backed by an equity injection led by Integrity Growth Partners (July 2021).

**A PE-backed consolidator that has already bought both the BI layer and the QBR layer is the most likely party to ship "secure interactive client reporting" as a feature.** That is the real competitive clock — not MSPBots shipping a click handler.

---

## Adjacent — general BI, where click-to-evidence is already commodity

| Competitor | Relevance | Reader sees underlying rows? |
| :--- | :--- | :--- |
| **Power BI** | The "why not just use Power BI" objection. Cognition360 is *built on it*. | **Yes.** *Show as a table*, *Show data point as a table*, drill-through, *See Records* — documented in Microsoft's **end-user** docs. Not developer features. Limits: no *See Records* on calculated measures or live multidimensional models. |
| **Metabase** | Cheap/free. Drill-through is a marketed headline feature. | **Yes** |
| **Looker Studio** | Free. Google-ecosystem MSPs will ask. | Yes |
| **Databox** | Multi-source dashboards, not MSP-specific | $64 / $159 / $399 per mo (annual) + $5.60/mo per extra data source; white-label add-on. Counts each GA4 property as a separate source — real cost runs above headline. |

> **This block is why the `IDEA.md` moat sentence had to change.** Click-a-chart-see-the-rows is table stakes in BI. RipoDoc cannot claim to have invented it.

---

## Adjacent — interactive documents

| Competitor | Relevance | Data binding? | Reader sees underlying rows? |
| :--- | :--- | :--- | :--- |
| **Foleon** | Closest *document-shaped* analogue. Data Visualizer: paste/import data → branded bar/column/line/pie charts, saved as reusable assets, auto-updating across Docs. Doc-level engagement analytics. | Yes, authored | **No evidence found.** Foleon's "drill down" refers to *analytics about reader engagement*, not into the chart's data. |
| **Ceros** | Interactive content, embeddable charts | Limited | No |
| **PandaDoc** | Document tracking, e-signature | No | No |
| **Gamma** | AI-generated decks | No | No |

**The gap is real and specific:** BI tools give the reader the rows but are dashboards. Document tools give the narrative but not the rows. **Nobody found does both in a client-facing document with a review gate and an audit trail.** That is the surviving, defensible claim.

---

## Build-vs-buy — embedded analytics (for RipoDoc's "embedded mode")

Not competitors. These are what RipoDoc would either use or replace if it ships embedded reports inside an MSP's own portal.

| Platform | Price | Note |
| :--- | :--- | :--- |
| **Luzmo** (ex-Cumul.io) | $495/mo Starter · **$1,995/mo Premium** for white-labelling. Scales with monthly active users. | JS SDK / web components, no iframes |
| **Explo** | Not published | Developer-friendly, customer-facing report building, white-label theming |
| **Cube** | Not published | Governance and scale |

> **Cost warning for embedded mode:** white-labelling starts at $1,995/mo on Luzmo and scales with monthly active users. If every MSP client executive is an active user, that model inverts RipoDoc's gross margin. Price embedded mode only after modelling MAU cost — or build the renderer in-house, which the Go/Next.js architecture already implies.

---

## Positioning matrix

| | Document-shaped | Reader sees underlying rows | Human review gate | Recipient-bound + revocable | Immutable audit trail | MSP-native |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| MSPBots | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ |
| BrightGauge | ✗ | ~ | ✗ | ~ | ✗ | ✓ |
| Cognition360 | ✗ | ✓ (via Power BI) | ✗ | ~ | ✗ | ✓ |
| Lifecycle Insights | ✓ | ✗ | ✗ | ~ | ✗ | ✓ |
| CloudRadial | ~ portal | ~ | ✗ | ✓ (portal login) | ✗ | ✓ |
| Handover | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Power BI / Metabase | ✗ | ✓ | ✗ | ~ | ✗ | ✗ |
| Foleon | ✓ | ✗ | ✗ | ~ | ✗ | ✗ |
| **RipoDoc (target)** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** |

**Read the matrix honestly:** RipoDoc's uniqueness is **not** any single column. Every column is occupied by someone. It is the **combination** — and specifically the three columns nobody occupies: *human review gate*, *recipient-bound + revocable*, *immutable audit trail*.

That is a defensible claim. "Nobody lets you click a chart" is not.

---

## Sources

- [Handover — MSP reporting software](https://gethandover.uk/msp-reporting-software) · [Handover home](https://gethandover.uk/) · [ConnectWise integration announcement](https://gethandover.uk/blog/connectwise-manage-integration-msp-reporting)
- [MSPBots — Business Intelligence](https://mspbots.ai/business-intelligence/) · [pricing](https://mspbots.ai/pricing/) · [data security](https://mspbots.ai/data-security/)
- [ConnectWise — Reports and Dashboards (BrightGauge) pricing](https://www.connectwise.com/platform/brightgauge/pricing)
- [ScalePad Cognition360](https://www.scalepad.com/cognition360) · [pricing](https://www.scalepad.com/cognition360/pricing)
- [ScalePad Lifecycle Insights](https://www.scalepad.com/lifecycle-insights)
- [ScalePad acquires Cognition360 (Feb 2023)](https://www.scalepad.com/news/scalepad-acquires-cognition360/)
- [ScalePad acquires Lifecycle Insights (Apr 2023)](https://www.scalepad.com/news/scalepad-acquires-lifecycle-insights)
- [CloudRadial — Scaling the QBR](https://blog.cloudradial.com/6-steps-to-scaling-the-qbr-for-the-msp)
- [Microsoft Learn — Show the data used to create a visual (consumer)](https://learn.microsoft.com/en-us/power-bi/consumer/end-user-show-data)
- [Metabase — Drill-through](https://www.metabase.com/features/drill-through)
- [Databox pricing analysis](https://coefficient.io/databox-pricing)
- [Foleon Data Visualizer](https://how-to.foleon.com/data-visualizer/) · [Foleon Analytics](https://www.foleon.com/platform/analytics)
- [Luzmo pricing](https://www.luzmo.com/pricing)
