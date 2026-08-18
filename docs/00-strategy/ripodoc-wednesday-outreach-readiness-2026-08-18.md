# RipoDoc Wednesday MSP Outreach Readiness

**Prepared:** 2026-08-18

**Purpose:** Controlled founder-led MSP discovery outreach; not a bulk-email campaign.

**Status:** Send only after every applicable readiness gate below is complete.

> **Legal review note:** This is an operational checklist, not legal advice. A qualified lawyer should confirm the sender identity, target-jurisdiction rules, lawful basis or consent records, address, opt-out process, privacy disclosures, and final email copy before commercial outreach.

## 1. Non-negotiable send gate

Do **not** send a commercial outreach email until every applicable row is true. The United States CAN-SPAM framework applies to commercial B2B email and requires accurate routing information, non-deceptive subjects, commercial-message disclosure, a valid physical postal address, a working opt-out method, and timely opt-out handling.[1] Australia requires consent before marketing messages, accurate sender identification/contact details, and an unsubscribe mechanism; consent records are the sender’s responsibility.[2]

| Gate | United States outreach | Australian outreach | Owner evidence required before send |
| --- | --- | --- | --- |
| Sender identity | Required | Required | Exact legal/trading sender name and monitored reply inbox. |
| Physical/postal address | Required in commercial email | Contact details required | Approved business postal address suitable for commercial correspondence. |
| Contact basis | Commercial email rules still apply | Consent is required; do not use purchased or scraped lists without defensible consent | Per-recipient source URL, role, business relevance, jurisdiction, and documented consent basis where Australia is targeted. |
| Accurate subject and body | Required | Required | Founder-reviewed message that matches its subject and does not promise unproven outcomes. |
| Commercial disclosure | Required | Relevant transparency practice | Clear commercial context, not deceptive framing. |
| Opt-out | Required and must be honored within 10 business days | Required and must be honored within 5 working days | Functional, no-login, no-fee unsubscribe route or monitored reply instruction, plus a suppression record. |
| Suppression handling | Do not recontact an opt-out | Do not recontact an opt-out | One authoritative suppression list and owner. |
| Sender-domain readiness | Strongly required for deliverability | Strongly required for deliverability | Domain authentication, monitored replies, small manual initial cohort, and bounce handling. |
| Product honesty | Required | Required | No claim that hosted RipoDoc is generally available, certified, compliant, or proven by customer outcomes. |

## 2. What is ready to say

RipoDoc’s permitted message is narrow and evidence-accurate:

> RipoDoc is a controlled evidence-delivery layer for an MSP client report. It is designed to let an approved report claim be answered with reviewed, bounded support for the intended reader.

Do not claim that RipoDoc replaces a PSA, RMM, BI platform, QBR platform, or client portal. Do not promise time savings, retention, ROI, compliance certification, security certification, healthcare readiness, automatic source-system integrations, hosted customer availability, or results from paying customers. The public sample uses fixture data and the current hosted workspace remains fail-closed until its production services are configured.

## 3. Wednesday sending plan

Start with **10 founder-reviewed United States accounts** only. Do not automate the first batch. Hold Australian commercial outreach until the business owner and counsel confirm a documented consent basis for every intended recipient.

| Window | Action | Stop condition |
| --- | --- | --- |
| Before Wednesday | Complete the sender, address, opt-out, suppression, domain, and account-research gates. | Any required sender/compliance fact is missing. |
| Wednesday morning | Review 10 target accounts; record one factual public observation and source URL per account. | Observation is speculative, stale, unrelated to reporting, or sourced from personal/private data. |
| Wednesday send window | Send one manually reviewed Email 1 to each approved account from a real monitored founder mailbox. | Bounce, complaint, unsubscribe, incorrect recipient, or personalization error. Pause the cohort and correct the process. |
| Wednesday afternoon | Review replies, bounces, unsubscribes, and delivery signals. Log only minimum necessary outreach data. | Deliverability or compliance concern appears. Do not increase volume. |
| Thursday | Send no follow-up automatically. Only answer replies or schedule a requested teardown. | No qualified response. Retain the account in the normal four-touch cadence only if it remains eligible. |
| Weekly | Review relevance, reply quality, discovery evidence, opt-outs, bounces, and suppression handling. | No recurring report-trust pain emerges after the planned discovery cohort. Reposition before increasing volume. |

## 4. Account review worksheet

Use one row per business account. Do not store customer-report content, passwords, private personal data, or inferred sensitive information.

| Field | Required value |
| --- | --- |
| `account_name` | Public business name. |
| `website` | Public company URL. |
| `recipient_name` | Publicly verified business contact name. |
| `recipient_role` | Relevant role, such as MSP owner, vCIO leader, account-management lead, or service-delivery lead. |
| `work_email` | Business email only, collected and used according to the approved jurisdictional basis. |
| `jurisdiction` | `US`, `AU`, or `do-not-send-until-reviewed`. |
| `public_observation` | One factual sentence based on the business’s own public content. |
| `observation_source_url` | Source for the observation. |
| `contact_basis` | Required operational/legal basis, especially for Australian contacts. |
| `send_status` | `draft`, `approved`, `sent`, `replied`, `not-interested`, `unsubscribed`, `bounced`, or `closed`. |
| `suppressed_at` | Required when a recipient opts out or requests no contact. |
| `owner` | Human responsible for the account record and reply handling. |

## 5. Sendable Email 1 only after the gate is complete

Replace every bracketed value before sending. Do not send a template with placeholders.

**Subject:** `A QBR question for [Company]`

> Hi [First name],
>
> [One factual public observation about the company’s reporting, QBR, vCIO, or account-management practice.]
>
> I am working on RipoDoc, a controlled evidence-delivery layer for MSP client reports. The narrow question is what happens after a client sees a QBR metric and asks, “Where did that number come from?”
>
> Rather than send a broad export or move the conversation into another portal, the idea is to make one approved claim answerable with reviewed, bounded support for the intended reader.
>
> Is that a report moment your team encounters, or not really?
>
> [Founder name]; [true sender/legal or trading name]; [monitored reply email]; [valid postal address]; [required commercial-message disclosure, if counsel directs]; and a functional no-login opt-out instruction or URL.

The follow-up sequence remains in [`ripodoc-msp-founder-email-outreach-playbook-2026-08-15.md`](ripodoc-msp-founder-email-outreach-playbook-2026-08-15.md). Add the approved sender identity, address, commercial disclosure where required, and opt-out mechanism to every commercial message before use.

## 6. Reply handling

- Mark an explicit opt-out, “no,” or unsubscribe request as suppressed immediately; do not argue, reframe, or add the person to another outreach path.
- Treat delivery failures as a list-quality issue, not a reason to search for replacement personal addresses.
- If a recipient requests information, send only the public report diagnostic, public sample, or canonical QBR guide. Do not ask for client reports, credentials, sensitive operational exports, PHI/ePHI, or customer identifiers through marketing email.
- If a recipient requests a teardown, use a short call to map one claim, source, reader, reviewer, and delivery boundary. Treat it as discovery, not an entitlement to ingest customer data.
- Record the exact customer language about the report moment, existing workaround, source system, reviewer, price/budget path, and next decision. Do not convert polite interest into a paid-pilot claim.

## 7. Product and production promise boundary

The outreach call to action is a **report teardown**, a public method, or a public sample. It is not a promise of an active hosted workspace or an invitation to upload customer data. Before a paid hosted pilot is accepted, RipoDoc must pass production preflight in its real runtime, complete controlled end-to-end smoke testing, establish backup/restore and incident ownership, and have approved commercial/legal terms.

## References

[1]: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business "Federal Trade Commission — CAN-SPAM Act: A Compliance Guide for Business"
[2]: https://www.acma.gov.au/avoid-sending-spam "Australian Communications and Media Authority — Avoid sending spam"
