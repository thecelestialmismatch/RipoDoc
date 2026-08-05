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

export type ElementKind = 'kpi' | 'bar-chart' | 'line-chart' | 'table' | 'claim';

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
  /** For `line-chart`: ordered (x, y) points. */
  readonly lineSeries?: readonly { readonly label: string; readonly value: number }[];
  /** For `table`: the full column set to render. */
  readonly tableColumns?: readonly EvidenceColumn[];
  readonly evidence: EvidenceDetail;
}

export interface ReportRecipient {
  readonly name: string;
  readonly email: string;
}

/**
 * Where the data came from — declared by the customer at upload time.
 * Optional on the manifest for backward compatibility with existing shipped
 * manifests that predate the authoring studio.
 */
export interface DataSource {
  /** e.g. "PSA — ConnectWise Manage", "RMM — NinjaOne", "Excel export". */
  readonly system: string;
  /** Free-text description of the source, e.g. "Ticket export, Q2 2026". */
  readonly description: string;
  /** Optional connection detail, e.g. "API v2", "manual export". */
  readonly method?: string;
  /** ISO 8601 timestamp of when the source was captured. */
  readonly capturedAt: string;
}

/** Supported upload formats for the authoring studio. */
export type UploadFormat =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'csv'
  | 'xlsx'
  | 'txt'
  | 'png'
  | 'jpg'
  | 'jpeg';

/** A parsed column from an uploaded data file. */
export interface SourceColumn {
  /** Stable id, e.g. "col-0". */
  readonly id: string;
  /** Original header text from the file. */
  readonly header: string;
  /** Inferred type from the first N non-empty rows. */
  readonly dataType: 'string' | 'number' | 'date' | 'boolean';
  /** Sample values for preview (max 5). */
  readonly sampleValues: readonly string[];
}

/** A parsed data file ready for mapping. */
export interface ParsedSourceFile {
  readonly fileId: string;
  readonly fileName: string;
  readonly format: UploadFormat;
  readonly sizeBytes: number;
  readonly columns: readonly SourceColumn[];
  /** First 50 rows for preview. */
  readonly previewRows: readonly Readonly<Record<string, string>>[];
  readonly rowCount: number;
  readonly source: DataSource;
}

/** How a mapped field should be visualised. */
export type VisualizationKind = 'kpi' | 'bar-chart' | 'line-chart' | 'table' | 'claim';

/** A single drag-and-drop field binding. */
export interface FieldMapping {
  /** Stable id, e.g. "map-1". */
  readonly id: string;
  /** The source column id this mapping reads from. */
  readonly columnId: string;
  /** What the customer wants this field to become. */
  readonly visualization: VisualizationKind;
  /** Display label, defaults to the column header. */
  readonly label: string;
  /** For kpi: pre-formatted value, e.g. "$89,125". */
  readonly format?: string;
  /** For bar-chart/line-chart: the label column id (x-axis). */
  readonly categoryColumnId?: string;
  /** For bar-chart/line-chart: the value column id (y-axis). */
  readonly valueColumnId?: string;
  /** For claim: the sentence template with {column} placeholders. */
  readonly claimTemplate?: string;
  /** Optional custom source query override. */
  readonly sourceQuery?: string;
}

/** A complete authoring draft before it becomes a ReportManifest. */
export interface ReportDraft {
  readonly draftId: string;
  readonly title: string;
  readonly provider: string;
  readonly client: string;
  readonly periodLabel: string;
  readonly recipient: ReportRecipient;
  readonly source: DataSource;
  readonly files: readonly ParsedSourceFile[];
  readonly mappings: readonly FieldMapping[];
  readonly createdAt: string;
  readonly updatedAt: string;
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
  /** Where the data came from. Optional for backward compatibility. */
  readonly source?: DataSource;
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
