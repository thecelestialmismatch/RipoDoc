# Teardown — MSPBots Public Report Link

**Observed: 2026-07-26.** Method: loaded the URL in a clean browser session. No account, no login, no credentials, no cookies.

> **Data handling.** The link exposes a real, named MSP's live client data. **No client names, ticket IDs, deal values or margin figures are reproduced in this file, and none were retained.** Only the shape and the security properties of the artifact are recorded. If this teardown is ever shown to a prospect, show *their own* MSPBots link, not someone else's.

---

## 1. What was expected vs. what is actually there

`IDEA.md` §2 frames the problem as: *MSPs send clients a flat PDF; the client can see a chart but cannot click anything.*

**The artifact does not match that description.**

| Expected (per `IDEA.md`) | Actually observed |
| :--- | :--- |
| A static PDF | A **live, server-rendered interactive dashboard** |
| Charts with no underlying data | **8 chart widgets plus full row-level detail grids** |
| Client cannot see the rows | **The rows are already on the page**, unprompted |
| No export | `Export Options` present in the UI |
| No interactivity | Multi-select filter control (technician), populated with 66 individuals |

Page payload: approximately 43,000 characters of rendered text. The markup contains 23 occurrences of `drill`.

---

## 2. What the page discloses

Categories only — no values reproduced.

- Report title, naming the **MSP and the report's subject**
- Headline revenue KPI tiles
- A detail grid with one row per sales opportunity, columns including: ticket identifier, **assigned staff member's full name**, ticket type, **end-client organisation name**, pipeline status, quotation flags and counts, estimate, **annualised opportunity value**, and **profit**
- A filter listing **66 named staff members**
- Aggregate counts of open, unworked and unprogressed opportunities

In plain terms: **the MSP's client list, its per-deal margins, and its entire technician roster**, on a URL that requires nothing to open.

---

## 3. Security properties — observed and unknown

| Property | Status |
| :--- | :--- |
| Authentication required | **No.** Opened in a clean session with no credentials. |
| Bound to a recipient | **No.** The token is in the query string. Anyone holding the URL is authorised. |
| Forward-resistant | **No.** Forwarding the link forwards the access. |
| Revocable | **Unknown.** Not observable from the reader side. |
| Expiring | **Unknown.** Not observable in a single session. |
| Watermarked with the viewer's identity | **No.** Nothing viewer-specific rendered. |
| Download / export restricted | **No.** `Export Options` exposed to the anonymous viewer. |
| Access logged and visible to the MSP | **Unknown.** Not observable from the reader side. |
| Vendor security posture (org level) | MSPBots states SOC 2 Type II completion and a SOC 2 certified data centre. |

> **This is not an MSPBots vulnerability.** It is a public-sharing feature working as designed, used the way sharing features are usually used. The vendor's org-level security posture is sound. The gap is that **link-based sharing has no concept of a recipient** — and that gap is the product opportunity.

---

## 4. What this changes in the RipoDoc thesis

### 4.1 The premise inverts

The problem is **not** "the client can't see the data." The MSPBots public report shows the data — arguably far too much of it, to far too many people.

The problem is **"the MSP cannot control who sees which data, cannot prove who saw it, and cannot take it back."**

### 4.2 The moat sentence must be rewritten

`IDEA.md:251` and `:291` claim no existing MSP reporting tool lets a client click a chart and see the rows. **This artifact refutes that directly**, alongside the Power BI and Metabase evidence in [market-evidence.md](./market-evidence.md) §5.

Surviving, defensible differentiators — the three columns nobody in [competitor-map.md](./competitor-map.md) occupies:

1. **A human review gate** between extraction and publication
2. **Recipient-bound, expiring, revocable, watermarked** delivery
3. **An immutable audit trail** of publication, access, export and revocation

### 4.3 Scoped disclosure becomes a headline feature, not a footnote

The observed page dumps every row to every viewer. RipoDoc's answer is not "more data on click" — it is **less data by default, more on demand, scoped per recipient, logged every time.** A client executive should see the 14 items behind *their* number, not the MSP's whole pipeline including other clients' margins.

This reframes the review queue too: it is not only *"is this number right?"* but *"should this recipient see this row at all?"*

### 4.4 The `IDEA.md` §2 problem statement needs revision

It argues from "PDFs are dead ends." That argument does not survive contact with this artifact. The stronger argument is: **"Reports are either dead PDFs or wide-open links. There is no middle."**

---

## 5. Use in sales

The single most persuasive demo available, and it costs nothing to build:

1. Ask the prospect to open **their own** public dashboard link, in an incognito window, logged out.
2. Let them notice that it works — and what is on it.
3. Ask: *"Who has this link? Can you tell? Can you take it back? Can you prove who opened it?"*
4. Show the same report in RipoDoc: bound to one recipient, expiring, watermarked, revocable, logged.

This tests §7.4 in [market-evidence.md](./market-evidence.md) — *will MSPs pay a premium for evidentiary rigour and secure delivery?* — in about four minutes, with no product built.

**Do not use a third party's link for this.** Use the prospect's own.

---

## 6. Caveats

- Single observation, single session, 2026-07-26. Expiry and revocation cannot be assessed from one visit.
- The link may be revoked at any time. **The finding is durable; the artifact is not.** Do not build a demo that depends on this specific URL resolving.
- MSPBots may offer authenticated or restricted sharing modes that this public link does not exercise. The observation is about *this sharing mode*, not the whole product.
- No claim is made that MSPBots is insecure. The claim is that **link-sharing without recipient binding is structurally unable to answer "who saw this?"** — and that is true of every vendor doing it, RipoDoc included, unless it is designed otherwise from the start.
