import type { ReportManifest } from './types.ts';

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
