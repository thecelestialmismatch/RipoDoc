import { findElement, type ReportManifest } from './types.ts';

export interface ReportAuditSummary {
  readonly status: 'durable' | 'unavailable';
  readonly granted: number;
  readonly denied: number;
  readonly lastGrantedAt?: string;
  readonly lastEventAt?: string;
}

export interface ProofCoverageItem {
  readonly label: string;
  readonly detail: string;
  readonly state: 'ready' | 'attention';
}

export interface ProofOperationsSnapshot {
  readonly reportId: string;
  readonly reviewedFigures: number;
  readonly reviewedWithCompleteProvenance: number;
  readonly evidenceCoveragePercent: number;
  readonly state: 'ready' | 'attention';
  readonly recipientLabel: string;
  readonly sourceLabel: string;
  readonly sourceCapturedAt?: string;
  readonly coverage: readonly ProofCoverageItem[];
}

/**
 * A deliberately narrow operator record for one selected evidence reference.
 *
 * This contract is safe to pass to the dashboard because it does not carry the
 * recipient address, signed-link material, source query, audit events, or
 * supporting evidence rows. It describes declared delivery posture only.
 */
export interface EvidenceDeliveryReceipt {
  readonly reportId: string;
  readonly version: number;
  readonly reportTitle: string;
  readonly publishedAt: string;
  readonly status: 'ready' | 'attention';
  readonly claimReference: {
    readonly id: string;
    readonly label: string;
    readonly reviewer: string;
    readonly approvedAt: string;
  } | undefined;
  readonly recipientReference: string;
  readonly sourceDeclaration: string;
  readonly sourceCapturedAt?: string;
  readonly deliveryCondition: string;
  /** Individual expiry is enforced per signed link and intentionally is not retained in a report manifest. */
  readonly expiryCondition: string;
  readonly audit: ReportAuditSummary;
}

const complete = (value: string | undefined): boolean => Boolean(value?.trim());

/**
 * This is a delivery-readiness assessment of declared immutable manifest facts.
 * It is not a compliance determination, a data-quality score, or a claim that a
 * viewer cannot copy a browser page.
 */
export const assessProofOperations = (report: ReportManifest): ProofOperationsSnapshot => {
  const reviewedFigures = report.elements.length;
  const reviewedWithCompleteProvenance = report.elements.filter((element) => {
    const provenance = element.evidence.provenance;
    return complete(provenance.sourceSystem)
      && complete(provenance.sourceQuery)
      && complete(provenance.approvedBy)
      && complete(provenance.approvedAt);
  }).length;
  const evidenceCoveragePercent = reviewedFigures === 0
    ? 0
    : Math.round((reviewedWithCompleteProvenance / reviewedFigures) * 100);
  const sourceDeclared = complete(report.source?.system) && complete(report.source?.description);
  const sourceCaptured = complete(report.source?.capturedAt);
  const recipientConfigured = complete(report.recipient.name) && complete(report.recipient.email);
  const state = reviewedFigures > 0 && evidenceCoveragePercent === 100 && sourceDeclared && sourceCaptured && recipientConfigured
    ? 'ready'
    : 'attention';

  return {
    reportId: report.reportId,
    reviewedFigures,
    reviewedWithCompleteProvenance,
    evidenceCoveragePercent,
    state,
    recipientLabel: recipientConfigured ? `${report.recipient.name} · recipient configured` : 'Recipient configuration needs attention',
    sourceLabel: sourceDeclared ? report.source!.system : 'Source declaration needs attention',
    sourceCapturedAt: report.source?.capturedAt,
    coverage: [
      {
        label: 'Approved evidence',
        detail: reviewedFigures === 0
          ? 'No approved figures are declared in this report.'
          : `${reviewedWithCompleteProvenance} of ${reviewedFigures} figure${reviewedFigures === 1 ? '' : 's'} include source, query, reviewer, and approval time.`,
        state: reviewedFigures > 0 && evidenceCoveragePercent === 100 ? 'ready' : 'attention',
      },
      {
        label: 'Source capture',
        detail: sourceDeclared && sourceCaptured
          ? `${report.source!.system} was declared with a capture time.`
          : 'Declare the source system, source description, and capture time before treating this report as delivery-ready.',
        state: sourceDeclared && sourceCaptured ? 'ready' : 'attention',
      },
      {
        label: 'Recipient binding',
        detail: recipientConfigured
          ? 'The published report names a recipient. Evidence links require recipient proof before rows render.'
          : 'Add the intended recipient before publishing a controlled evidence link.',
        state: recipientConfigured ? 'ready' : 'attention',
      },
    ],
  };
};

/**
 * Create an operator-facing receipt from existing immutable report facts and a
 * report-level audit summary. No delivery is issued here, and this function
 * must never be expanded to include recipient addresses, signed tokens, source
 * queries, or evidence rows.
 */
export const createEvidenceDeliveryReceipt = (input: {
  readonly report: ReportManifest;
  readonly snapshot: ProofOperationsSnapshot;
  readonly audit: ReportAuditSummary;
  readonly elementId?: string;
}): EvidenceDeliveryReceipt => {
  const element = input.elementId ? findElement(input.report, input.elementId) : input.report.elements[0];
  const provenance = element?.evidence.provenance;
  const source = input.report.source;

  return {
    reportId: input.report.reportId,
    version: input.report.version,
    reportTitle: input.report.title,
    publishedAt: input.report.publishedAt,
    status: input.snapshot.state,
    claimReference: element && provenance
      ? {
        id: element.id,
        label: element.label,
        reviewer: provenance.approvedBy,
        approvedAt: provenance.approvedAt,
      }
      : undefined,
    recipientReference: input.snapshot.recipientLabel,
    sourceDeclaration: source && complete(source.system) && complete(source.description)
      ? `${source.system} · ${source.description}`
      : 'Source declaration needs attention',
    sourceCapturedAt: source?.capturedAt,
    deliveryCondition: 'Recipient proof is required before approved evidence rows render.',
    expiryCondition: 'Expiry is enforced per recipient-bound delivery link; the immutable report manifest does not retain individual link deadlines.',
    audit: input.audit,
  };
};
