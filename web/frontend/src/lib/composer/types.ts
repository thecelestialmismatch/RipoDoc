export const LOCAL_COMPOSER_MAX_BYTES = 20 * 1024 * 1024;
export const LOCAL_COMPOSER_MAX_PAGES = 120;
export const LOCAL_COMPOSER_MAX_TEXT = 180_000;

export type LocalComposerStatus = 'idle' | 'reading' | 'ready' | 'error';
export type DraftStatus = 'draft' | 'needs-evidence' | 'ready-for-review' | 'approved';
export type EvidenceStrength = 'strong' | 'partial' | 'missing';

export type LocalDocument = {
  readonly fileName: string;
  readonly byteLength: number;
  readonly pageCount: number;
  readonly extractedText: string;
  readonly extractedAt: string;
};

export type ApprovedSource = {
  readonly sourceId: string;
  readonly reportId: string;
  readonly reportTitle: string;
  readonly client: string;
  readonly elementId: string;
  readonly label: string;
  readonly summary: string;
  readonly provenance: string;
  readonly approvedBy: string;
  readonly approvedAt: string;
  readonly searchText: string;
};

export type SourceCitation = {
  readonly sourceId: string;
  readonly label: string;
  readonly reportTitle: string;
  readonly elementId: string;
  readonly provenance: string;
  readonly approvedBy: string;
  readonly approvedAt: string;
  readonly excerpt: string;
  readonly score: number;
};

export type QuestionDraft = {
  readonly id: string;
  readonly ordinal: number;
  readonly question: string;
  readonly answer: string;
  readonly status: DraftStatus;
  readonly strength: EvidenceStrength;
  readonly citations: readonly SourceCitation[];
  readonly gaps: readonly string[];
  readonly reviewerNote: string;
};

export type ComposerReceipt = {
  readonly generatedAt: string;
  readonly documentName: string;
  readonly documentPages: number;
  readonly localOnly: true;
  readonly approvedSourcesConsidered: number;
  readonly questionsDetected: number;
  readonly drafts: readonly QuestionDraft[];
};

export type LocalComposerError = {
  readonly code: 'not-pdf' | 'too-large' | 'empty' | 'encrypted-or-invalid' | 'page-limit' | 'no-text' | 'unexpected';
  readonly message: string;
};
