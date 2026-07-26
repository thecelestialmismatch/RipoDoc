# Market Evidence — RipoDoc

> Every claim below carries a source, a retrieval date, and a strength tag.
> **Nothing in this file may be restated elsewhere without its tag.** The defect this file exists to fix is `IDEA.md:213-221`, which presented a UK government census figure and an unvalidated guess in the same table with identical formatting.

**Retrieval date for all rows: 2026-07-26.**

## Tag definitions

| Tag | Meaning |
| :--- | :--- |
| **VERIFIED** | Read from the primary source (the issuing body's own publication). |
| **SECONDARY** | Reported by a credible third party; primary source not yet read. Do not use externally until upgraded. |
| **DERIVED** | RipoDoc's own calculation. Method shown. Attack the method, not the number. |
| **WEAK** | Vendor blog or marketing content with a commercial interest in the number. Directionally useful, not citable. |
| **CONTRADICTED** | A claim previously in `IDEA.md` that the evidence refutes. |
| **ASSUMPTION** | Still unvalidated. No source exists. Must be tested with customers. |

---

## 1. Market size and MSP population

| # | Claim | Value | Tag | Source |
| :--- | :--- | :--- | :--- | :--- |
| 1.1 | Active MSPs in the UK | **11,492** (as of Aug 2023) | **VERIFIED** | [DSIT, *Research on UK managed service providers*, published 12 Feb 2024](https://gov.uk/government/publications/research-on-managed-service-providers/research-on-uk-managed-service-providers) |
| 1.2 | UK MSP size distribution | Micro 6,623 (59%) · Small 3,182 (28%) · Medium 1,052 (9%) · Large 460 (4%) | **VERIFIED** | ibid. |
| 1.3 | UK MSPs with ≥50 employees | **1,512 — 13% of the market** | **VERIFIED** (arithmetic on 1.2) | ibid. |
| 1.4 | UK MSP sector revenue (2022) | £52.6bn managed-services revenue; £29.1bn direct GVA; ~294,340 FTEs | **VERIFIED** | ibid. |
| 1.5 | Revenue concentration | Large MSPs = 4% of firms but **74% of revenue** (£38.8bn). Top 10 firms ≈ 27% of all sector revenue. | **VERIFIED** | ibid. |
| 1.6 | "Dedicated" micro MSPs, UK | 5,065 | **VERIFIED** | ibid., §5.1 |
| 1.7 | ~~UK active MSPs = 5,030~~ | — | **CONTRADICTED** | No such figure exists in the DSIT research. Was in `IDEA.md:217`. See §1a below. |
| 1.8 | Firms delivering managed services, globally | **~341,000** (2025) | **SECONDARY** | [Canalys MSP Trends and Predictions 2025, via Omdia/Informa](https://omdia.tech.informa.com/insights/2025/canalys-msp-trends-and-predictions-2025) |
| 1.9 | ~~Global MSP count ≈ 130,000~~ | — | **CONTRADICTED** | 2.6× below the Canalys count. Was in `IDEA.md:216`. Definitions differ (see §1b). |
| 1.10 | MSPs in the USA | 40,000+ | **SECONDARY** | [Infrascale, MSP Statistics USA](https://www.infrascale.com/msp-statistics-usa/) |
| 1.11 | Global MSP services revenue | ~$401bn (2025) | **SECONDARY** | Industry estimates. **This is IT services revenue, not a software TAM.** `IDEA.md:225` already states this correctly — keep that caveat. |

### 1a. Where the 5,030 came from

The DSIT research reports **5,065 "dedicated" micro MSPs** (1.6). That is almost certainly the origin of the `5,030` in `IDEA.md:217`. It is not the UK MSP population, and micro firms are the **inverse** of RipoDoc's ICP. The error understated the UK market by 2.3× while simultaneously pointing at the wrong segment.

### 1b. Why 130,000 and 341,000 both exist

Canalys counts *partners delivering managed services* — which includes VARs, resellers and telcos with a managed-services line, not just pure-play MSPs. The lower figures in circulation count pure-play MSPs. **Neither is wrong; they measure different things.** Any external use of a global figure must state the definition. Until the Canalys report itself is read, treat 1.8 as SECONDARY.

---

## 2. Ideal customer profile — how many firms actually qualify

RipoDoc's ICP (`IDEA.md:219`): **20–150 staff, 50+ managed customers.**

| # | Claim | Value | Tag | Basis |
| :--- | :--- | :--- | :--- | :--- |
| 2.1 | ~~ICP pool = 25,000–35,000 globally~~ | — | **CONTRADICTED** | Not supported by any size distribution. Was in `IDEA.md:219`. |
| 2.2 | English-speaking core MSP population (US, UK, CA, AU, NZ, IE) | **~60,000–70,000** | **DERIVED** | US ~40k (1.10, SECONDARY) + UK 11,492 (1.1, VERIFIED) + an allowance for CA/AU/NZ/IE. **Only the UK input is census-grade.** |
| 2.3 | Share of MSPs matching the ICP band | **13%–37%** | **DERIVED** | The ICP straddles the UK "small" (10–49 staff) and "medium" (50–249) bands. Lower bound = ≥50 staff share (1.3). Upper bound = small+medium share (37%). |
| 2.4 | **Qualifying ICP firms worldwide** | **~6,000–12,000** | **DERIVED** | 2.2 × 2.3. |

### Known weaknesses in 2.4 — attack these first

1. **Non-UK country counts are secondary or absent.** Only the UK has a government census.
2. **UK size distribution is assumed to generalise to the US.** It may not; the US market is larger and possibly more consolidated.
3. **"50+ managed customers" is not measured by any source.** It further reduces the pool by an unknown amount — 2.4 is therefore an **upper bound**.

### Consequences for the revenue model at `IDEA.md:229-236`

| Scenario in `IDEA.md` | Paying MSPs | Implied share of the ~6–12k ICP pool | Verdict |
| :--- | ---: | :--- | :--- |
| Healthy niche SaaS | 200 | 2–3% | Plausible |
| Serious vertical company | 1,000 | **8–17%** | Stretch, but achievable |
| Large MSP-platform business | 3,500 | 29–58% | Requires ICP expansion beyond the stated band |
| ~~$100M+ outcome~~ | 6,700 | **56–112% of every qualifying MSP on Earth** | **Not a scenario. Delete.** |

---

## 3. Competitor pricing — the category band

Full competitor detail in [competitor-map.md](./competitor-map.md). Prices only, for the budget argument in §4.

| # | Product | Price | Tag | Source |
| :--- | :--- | :--- | :--- | :--- |
| 3.1 | Handover | £49/mo Starter · £99/mo Growth | **SECONDARY** | [gethandover.uk](https://gethandover.uk/msp-reporting-software) |
| 3.2 | MSPBots (PSA BI dashboards) | $179/mo | **SECONDARY** | [mspbots.ai/pricing](https://mspbots.ai/pricing/) · [pricing wiki](https://wiki.mspbots.ai/display/MKB/MSPbots+Pricing+List) |
| 3.3 | Databox | $64 Analyst · $159 Pro · $399 Growth (annual billing) + $5.60/mo per extra data source; white-label add-on | **SECONDARY** | [Databox pricing analysis](https://coefficient.io/databox-pricing) |
| 3.4 | BrightGauge / ConnectWise Reports & Dashboards | $316/mo Standard · $436/mo Enterprise | **SECONDARY** | [ConnectWise pricing](https://www.connectwise.com/platform/brightgauge/pricing) |
| 3.5 | ScalePad Cognition360 | **from $449/mo**, priced on ConnectWise PSA active users — **plus a Microsoft Power BI licence per active user** | **SECONDARY** | [scalepad.com/cognition360/pricing](https://www.scalepad.com/cognition360/pricing) |
| 3.6 | Luzmo (embedded analytics infrastructure) | $495/mo Starter · $1,995/mo Premium (white-label). Scales with monthly active users. | **SECONDARY** | [luzmo.com/pricing](https://www.luzmo.com/pricing) |

**Category ceiling for an MSP-specific reporting tool: $449/mo** (3.5). Luzmo (3.6) is developer infrastructure sold to SaaS companies, not a tool an MSP buys — it belongs in build-vs-buy, not in the price comparison.

---

## 4. MSP software budgets — the constraint that decides pricing

| # | Claim | Value | Tag | Source |
| :--- | :--- | :--- | :--- | :--- |
| 4.1 | Average MSP annual spend on its entire software stack | **$10,000–$50,000** | **WEAK** | [Invarosoft](https://www.invarosoft.com/how-can-msps-cut-tool-stack-costs-with-a-unified-platform/) — a vendor selling stack consolidation, i.e. commercially motivated to make this number sound painful. |
| 4.2 | Vendors in a typical MSP stack | 15–20 | **WEAK** | ibid. |
| 4.3 | RMM cost | $1,500–$5,000/yr | **WEAK** | ibid. |
| 4.4 | PSA cost | $3,000–$12,000/yr | **WEAK** | ibid. |
| 4.5 | Time to prepare one QBR | 4–6 hours | **WEAK** | [Scopable](https://scopable.io/blog/msp-qbr-template) — vendor blog. |
| 4.6 | MSPs report saving 1–3 hrs/week with automated reporting | — | **WEAK** | Handover marketing (3.1). A competitor's own claim. |

> **All of §4 is WEAK.** Every number here comes from a vendor with something to sell. They point the same direction, which is mild corroboration, but **§4 must not be cited externally and must not be the sole basis for a pricing decision.** Replace with figures from your own discovery calls — "what do you currently spend on reporting tools, and what would you cut to pay for this?" is a two-question fix.

### The pricing argument (uses 3.x VERIFIED-adjacent + 4.1 WEAK)

`IDEA.md:579-620` proposes **$750 / $1,250 / $2,500 per month**.

- Core at $1,250/mo = **$15,000/yr** = 30–150% of an entire MSP software stack budget (4.1), for one reporting tool, in a category whose ceiling is $449/mo (3.5).
- Founding partner at $750/mo = $9,000/yr, prepaid quarterly.

**Supported conclusion (strong, negative):** the proposed ladder is unsupportable **as an additive purchase**.
**Not supported:** any specific replacement ladder. No evidence found prices a premium "evidence layer" product, because no such product was found. Do not invent three numbers; derive them from discovery calls.

**The structural finding — additive vs. displacement:**

| Path | Realistic price | Requires |
| :--- | :--- | :--- |
| **Additive** (16th–21st vendor in the stack) | Low hundreds/mo | Nothing new. But the $12k ACV in the model dies. |
| **Displacement** (replaces BrightGauge or Cognition360 as a line item) | $400–$1,000+/mo | **PSA/RMM connectors** — which `IDEA.md` defers until three paying customers request them. |

`IDEA.md` currently prices for displacement while road-mapping for additive. **That contradiction is worth more than the price number itself.** Resolve it before the first sales call.

---

## 5. Is "click a chart, see the rows" actually novel?

| # | Claim | Tag | Source |
| :--- | :--- | :--- | :--- |
| 5.1 | Power BI **report consumers** can right-click a visual → *Show as a table*, and right-click a data point → *Show data point as a table*. No developer involved. | **VERIFIED** | [Microsoft Learn — end-user docs](https://learn.microsoft.com/en-us/power-bi/consumer/end-user-show-data) |
| 5.2 | Power BI drill-through carries filter context to a detail page on right-click | **VERIFIED** | [Microsoft Learn — drillthrough](https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-drillthrough) |
| 5.3 | *See Records* does **not** work with calculated measures or live multidimensional models | **VERIFIED** | 5.1 |
| 5.4 | Metabase markets drill-through as a headline product feature | **SECONDARY** | [metabase.com/features/drill-through](https://www.metabase.com/features/drill-through) |
| 5.5 | MSPBots public reports already render row-level detail grids with export | **VERIFIED** (observed directly) | [mspbots-teardown.md](./mspbots-teardown.md) |
| 5.6 | ~~"No existing MSP reporting tool allows a client to click a chart and see the exact rows"~~ | **CONTRADICTED** | Was `IDEA.md:291`. Refuted by 5.1, 5.4, 5.5. |
| 5.7 | ~~"Power BI requires a BI developer" to expose underlying data~~ | **CONTRADICTED** | Was `IDEA.md:248`. The features in 5.1 ship to consumers. *Building* the report needs a developer; *reading the rows* does not. |
| 5.8 | Foleon offers a Data Visualizer (paste/import data → branded charts, reusable across Docs) and doc-level analytics | **SECONDARY** | [Foleon Data Visualizer](https://how-to.foleon.com/data-visualizer/) · [Foleon Analytics](https://www.foleon.com/platform/analytics) |
| 5.9 | No evidence found that Foleon exposes **underlying rows to the reader** | **SECONDARY** (absence of evidence) | ibid. Foleon's "drill down" refers to *analytics about document engagement*, not into the data. |

### What survives

Click-to-evidence is **commodity in BI tools** and **absent from document tools**. The defensible claim is not the interaction — it is the interaction *inside a narrative, client-facing document, gated by human review, bound to a recipient, and logged*. See `IDEA.md` §7 rewrite.

---

## 6. Feasibility of extracting data from a chart in a PDF

| # | Claim | Tag | Source |
| :--- | :--- | :--- | :--- |
| 6.1 | OCR **cannot** recover values from a chart — they are encoded as visual geometry, not text. Fundamental limit, not a tuning problem. | **SECONDARY** | [LlamaIndex — extracting data from charts](https://www.llamaindex.ai/blog/extracting-data-from-charts) · [NVIDIA — approaches to PDF data extraction](https://developer.nvidia.com/blog/approaches-to-pdf-data-extraction-for-information-retrieval/) |
| 6.2 | Vision-language models can estimate values, but accuracy degrades on axis-scale reading; smaller models show scale and magnitude errors | **SECONDARY** | ibid. |
| 6.3 | Bar charts **with data labels** are easiest. Box plots and unlabelled bars are hardest. Stacked and grouped bars are systematically harder (overlapping elements must be decomposed). | **SECONDARY** | ibid. |

### Product consequence

A PDF of a chart usually **does not contain the underlying rows at all**. Therefore:

- In standalone/PDF mode, the review queue is not primarily a trust feature — it is a **data-entry burden** placed on the MSP, because the author must supply data the file never had.
- **Connected mode (CSV / REST / PSA) is the only path where click-to-evidence is real rather than reconstructed.**
- `IDEA.md`'s exclusion list ("perfect extraction of every PDF without human review") is **correct and validated** — keep it. But the doc should stop leading with PDF upload as the headline capability.

---

## 7. Open assumptions — no source exists, must be tested with customers

| # | Assumption | Where it appears | How to test |
| :--- | :--- | :--- | :--- |
| 7.1 | 60–70% of target MSPs send regular client reports | `IDEA.md:220` | Discovery call question 1 |
| 7.2 | ~40% are dissatisfied with current reporting | `IDEA.md:221` | Discovery call question 2 |
| 7.3 | Report recipients (client executives) *want* to inspect underlying data | Core product premise | Show the mock to an actual MSP client, not to the MSP |
| 7.4 | MSPs will pay a premium for evidentiary rigour and secure delivery | Pricing model | Prepaid commitment only — `IDEA.md:768` |
| 7.5 | Net revenue retention ≥90% | `IDEA.md:241` | Cannot be tested pre-revenue |

**None of these were made more true by this research.** The gate at `IDEA.md:768` — count only prepaid customers as validation — remains the only thing that resolves them.

---

## Sources

- [DSIT — Research on UK managed service providers (12 Feb 2024)](https://gov.uk/government/publications/research-on-managed-service-providers/research-on-uk-managed-service-providers)
- [DSIT — Research on the managed service providers market 2025 (PDF)](https://assets.publishing.service.gov.uk/media/691331835dec0071ce496374/Research_on_the_managed_service_providers_market_2025.pdf)
- [Canalys MSP Trends and Predictions 2025 (via Omdia)](https://omdia.tech.informa.com/insights/2025/canalys-msp-trends-and-predictions-2025)
- [Infrascale — MSP Statistics USA](https://www.infrascale.com/msp-statistics-usa/)
- [Microsoft Learn — Show the data used to create a visual (consumer)](https://learn.microsoft.com/en-us/power-bi/consumer/end-user-show-data)
- [Microsoft Learn — Drillthrough in Power BI reports](https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-drillthrough)
- [Metabase — Drill-through](https://www.metabase.com/features/drill-through)
- [Handover — MSP reporting software](https://gethandover.uk/msp-reporting-software)
- [MSPBots pricing](https://mspbots.ai/pricing/)
- [ConnectWise — Reports and Dashboards pricing](https://www.connectwise.com/platform/brightgauge/pricing)
- [ScalePad Cognition360 pricing](https://www.scalepad.com/cognition360/pricing)
- [Databox pricing analysis](https://coefficient.io/databox-pricing)
- [Luzmo pricing](https://www.luzmo.com/pricing)
- [Foleon Data Visualizer](https://how-to.foleon.com/data-visualizer/)
- [LlamaIndex — Extracting data from charts](https://www.llamaindex.ai/blog/extracting-data-from-charts)
- [NVIDIA — Approaches to PDF data extraction](https://developer.nvidia.com/blog/approaches-to-pdf-data-extraction-for-information-retrieval/)
- [Invarosoft — MSP tool-stack costs](https://www.invarosoft.com/how-can-msps-cut-tool-stack-costs-with-a-unified-platform/) *(WEAK — vendor)*
- [Scopable — MSP QBR template](https://scopable.io/blog/msp-qbr-template) *(WEAK — vendor)*
