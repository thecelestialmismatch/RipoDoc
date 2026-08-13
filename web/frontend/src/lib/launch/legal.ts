export type LegalDocumentKey = 'privacy' | 'cookies' | 'terms' | 'refunds' | 'sla' | 'dpa' | 'healthcare-mode-b';

export interface LegalDocument {
  readonly key: LegalDocumentKey;
  readonly href: string;
  readonly title: string;
  readonly summary: string;
  readonly status: 'pre-launch';
}

export const legalDocuments: readonly LegalDocument[] = [
  {
    key: 'privacy',
    href: '/legal/privacy',
    title: 'Privacy information',
    summary: 'Verified data-flow information and the decisions required before a final privacy notice can be issued.',
    status: 'pre-launch',
  },
  {
    key: 'cookies',
    href: '/legal/cookies',
    title: 'Cookie information',
    summary: 'The current, necessary session and CSRF cookies and the change-control rule for non-essential technologies.',
    status: 'pre-launch',
  },
  {
    key: 'terms',
    href: '/legal/terms',
    title: 'Terms status',
    summary: 'The commercial and legal decisions required before binding service terms can be published.',
    status: 'pre-launch',
  },
  {
    key: 'refunds',
    href: '/legal/refunds',
    title: 'Refund and cancellation status',
    summary: 'The billing, cancellation, tax, and refund decisions required before a paid hosted offering launches.',
    status: 'pre-launch',
  },
  {
    key: 'sla',
    href: '/legal/sla',
    title: 'Service level status',
    summary: 'The measurement, support, maintenance, and credit commitments required before an SLA can be offered.',
    status: 'pre-launch',
  },
  {
    key: 'dpa',
    href: '/legal/dpa',
    title: 'Data processing status',
    summary: 'The processor, subprocessor, retention, security, and transfer decisions required before a DPA can be issued.',
    status: 'pre-launch',
  },
  {
    key: 'healthcare-mode-b',
    href: '/legal/healthcare-mode-b',
    title: 'Healthcare Mode B',
    summary: 'A restricted healthcare evaluation posture that is not a HIPAA certification or a public PHI/ePHI service.',
    status: 'pre-launch',
  },
] as const;

export const legalDocument = (key: LegalDocumentKey): LegalDocument => {
  const document = legalDocuments.find((candidate) => candidate.key === key);
  if (!document) throw new Error(`Unknown legal document key: ${key}`);
  return document;
};

export const legalStatusNotice = 'Pre-launch information only — not a final contract, privacy notice, refund policy, SLA, or data processing agreement.';

export const legalDecisionNotice = 'RipoDoc will publish final legal terms only after the accountable business owner supplies the legal entity, jurisdiction, commercial model, data-processing facts, and any required counsel approvals.';

export const modeBNotice = 'Healthcare Mode B is a restricted evaluation and self-hosted posture. It is not a HIPAA certification, a business associate agreement, or a representation that the public RipoDoc service accepts or processes PHI/ePHI.';
