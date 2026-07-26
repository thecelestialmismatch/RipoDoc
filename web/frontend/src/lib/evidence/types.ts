/**
 * The interaction manifest.
 *
 * This is the contract between three things that must never disagree:
 *  1. the PDF the client receives,
 *  2. the evidence page a click opens,
 *  3. the audit record of what was published.
 *
 * Every interactive element in a report is declared here with the *approved*
 * rows behind it. Nothing is computed at view time — see
 * `docs/02-product/interaction-spec.md` §"Determinism".
 */

export type ColumnAlign = 'left' | 'right';

export interface EvidenceColumn {
  /** Key into each row object. */
  readonly key: string;
  readonly label: string;
  readonly align?: ColumnAlign;
}

export type EvidenceCell = string | number;

export interface EvidenceTable {
  readonly columns: readonly EvidenceColumn[];
  readonly rows: readonly Readonly<Record<string, EvidenceCell>>[];
}

/**
 * Provenance for one element. `approvedBy` is a human — the review gate is the
 * product's trust boundary, so an unapproved element must never reach a client.
 */
export interface EvidenceProvenance {
  readonly sourceSystem: string;
  readonly sourceQuery: string;
  readonly approvedBy: string;
  /** ISO 8601 timestamp. */
  readonly approvedAt: string;
}

export interface EvidenceDetail {
  readonly title: string;
  readonly summary: string;
  readonly table: EvidenceTable;
  readonly provenance: EvidenceProvenance;
}

export type ElementKind = 'kpi' | 'bar-chart' | 'claim';

export interface BarDatum {
  readonly label: string;
  readonly value: number;
}

export interface ReportElement {
  /** Stable, URL-safe. Appears in the evidence URL, so it must never change. */
  readonly id: string;
  readonly kind: ElementKind;
  readonly label: string;
  /** Pre-formatted headline value for `kpi`, e.g. "$89,125". */
  readonly value?: string;
  /** Supporting caption under a KPI, or the sentence for a `claim`. */
  readonly caption?: string;
  /** Series for `bar-chart`. */
  readonly series?: readonly BarDatum[];
  readonly evidence: EvidenceDetail;
}

export interface ReportRecipient {
  readonly name: string;
  readonly email: string;
}

export interface ReportManifest {
  readonly reportId: string;
  /** Incremented on every publish. Published versions are immutable. */
  readonly version: number;
  readonly title: string;
  /** The MSP publishing the report. */
  readonly provider: string;
  /** The end client the report is about. */
  readonly client: string;
  readonly periodLabel: string;
  /** ISO 8601. */
  readonly publishedAt: string;
  readonly recipient: ReportRecipient;
  readonly elements: readonly ReportElement[];
}

/** Look up one element by id. */
export const findElement = (
  manifest: ReportManifest,
  elementId: string,
): ReportElement | undefined => manifest.elements.find((element) => element.id === elementId);

/** Render a cell for display. Numbers are localised; strings pass through. */
export const formatCell = (value: EvidenceCell): string =>
  typeof value === 'number' ? value.toLocaleString('en-US') : value;
