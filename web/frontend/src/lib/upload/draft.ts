/**
 * Draft management: creating, updating, and converting drafts to manifests.
 *
 * A ReportDraft is the mutable authoring state: title, provider, client,
 * recipient, source, uploaded files, and field mappings. When the author
 * publishes, draftToManifest converts it into an immutable ReportManifest
 * that passes full manifest validation.
 */

import { randomBytes } from 'node:crypto';
import { parseManifest } from '@/lib/evidence/manifest.ts';
import type {
  EvidenceColumn,
  EvidenceDetail,
  FieldMapping,
  ParsedSourceFile,
  ReportDraft,
  ReportElement,
  ReportManifest,
  ReportRecipient,
  DataSource,
  SourceColumn,
  EvidenceProvenance,
} from '@/lib/evidence/types.ts';

/** Slugify a label into a URL-safe element id. */
export const slugifyElementId = (label: string): string =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 63) || 'element';

/** Generate a unique draft id. */
export const generateDraftId = (): string => `draft-${randomBytes(8).toString('hex')}`;

/** Generate a unique report id from a title and timestamp. */
export const generateReportId = (title: string): string => {
  const slug = slugifyElementId(title) || 'report';
  return `${slug}-${randomBytes(4).toString('hex')}`;
};

/** Default author name for provenance. */
const DEFAULT_APPROVER = 'Report Author';

/** Create a new draft with a fresh draftId and timestamps. */
export const createDraft = (input: {
  readonly title: string;
  readonly provider: string;
  readonly client: string;
  readonly periodLabel: string;
  readonly recipient: ReportRecipient;
  readonly source: DataSource;
  readonly files: readonly ParsedSourceFile[];
}): ReportDraft => {
  const now = new Date().toISOString();
  return {
    draftId: generateDraftId(),
    title: input.title,
    provider: input.provider,
    client: input.client,
    periodLabel: input.periodLabel,
    recipient: input.recipient,
    source: input.source,
    files: input.files,
    mappings: [],
    createdAt: now,
    updatedAt: now,
  };
};

/** Immutably update a draft; bumps updatedAt. */
export const updateDraft = (
  draft: ReportDraft,
  patch: Partial<ReportDraft>,
): ReportDraft => ({
  ...draft,
  ...patch,
  updatedAt: new Date().toISOString(),
});

/** Get the column for a given column id from any of the draft's files. */
const getColumn = (draft: ReportDraft, columnId: string): SourceColumn | undefined => {
  for (const file of draft.files) {
    const found = file.columns.find((col) => col.id === columnId);
    if (found) return found;
  }
  return undefined;
};

/** Get all row values for a column from the draft's preview data. */
const getColumnValues = (draft: ReportDraft, columnId: string): string[] => {
  const values: string[] = [];
  for (const file of draft.files) {
    for (const row of file.previewRows) {
      const val = row[columnId];
      if (val !== undefined && val !== '') values.push(val);
    }
  }
  return values;
};

/** Format a numeric value for display. */
const formatNumber = (value: string): string => {
  const n = Number(value.replace(/,/g, ''));
  if (!Number.isNaN(n) && Number.isFinite(n)) {
    return n.toLocaleString('en-US');
  }
  return value;
};

/** Build evidence detail from a mapping and the draft's source data. */
const buildEvidenceFromMapping = (
  draft: ReportDraft,
  mapping: FieldMapping,
): EvidenceDetail => {
  const column = getColumn(draft, mapping.columnId);
  const label = mapping.label || column?.header || mapping.columnId;
  const values = getColumnValues(draft, mapping.columnId);
  const rows = values.map((v, i) => ({ row: String(i + 1), value: v }));
  const columns: EvidenceColumn[] = [
    { key: 'row', label: 'Row' },
    { key: 'value', label: column?.header || 'Value' },
  ];

  const provenance: EvidenceProvenance = {
    sourceSystem: draft.source.system || 'Manual entry',
    sourceQuery:
      mapping.sourceQuery ||
      `SELECT ${column?.header || mapping.columnId} FROM ${draft.files[0]?.fileName || 'uploaded file'}`,
    approvedBy: DEFAULT_APPROVER,
    approvedAt: new Date().toISOString(),
  };

  return {
    title: label,
    summary: `Data from ${draft.source.system || 'uploaded source'} for "${label}".`,
    table: { columns, rows },
    provenance,
  };
};

/** Convert a completed draft into a validated ReportManifest. */
export const draftToManifest = (draft: ReportDraft): ReportManifest => {
  const reportId = generateReportId(draft.title);
  const now = new Date().toISOString();

  const elements: ReportElement[] = draft.mappings.map((mapping, index) => {
    const elementId = slugifyElementId(mapping.label) || slugifyElementId(`element-${index}`);
    const column = getColumn(draft, mapping.columnId);
    const values = getColumnValues(draft, mapping.columnId);
    const evidence = buildEvidenceFromMapping(draft, mapping);
    const baseElement = {
      id: elementId,
      kind: mapping.visualization,
      label: mapping.label || column?.header || `Element ${index + 1}`,
      caption: mapping.claimTemplate,
      evidence,
    };

    if (mapping.visualization === 'kpi') {
      const numericValues = values
        .map((v) => Number(v.replace(/,/g, '')))
        .filter((n) => !Number.isNaN(n));
      const count = numericValues.length;
      return {
        ...baseElement,
        value: mapping.format ?? (count > 0 ? formatNumber(String(count)) : '0'),
      } as ReportElement;
    }

    if (mapping.visualization === 'bar-chart') {
      const catColId = mapping.categoryColumnId || mapping.columnId;
      const valColId = mapping.valueColumnId || mapping.columnId;
      const catValues = getColumnValues(draft, catColId);
      const valValues = getColumnValues(draft, valColId);
      const series = catValues.map((cat, i) => ({
        label: cat,
        value: Number((valValues[i] ?? '0').replace(/,/g, '')) || 0,
      }));
      return { ...baseElement, series } as ReportElement;
    }

    if (mapping.visualization === 'line-chart') {
      const catColId = mapping.categoryColumnId || mapping.columnId;
      const valColId = mapping.valueColumnId || mapping.columnId;
      const catValues = getColumnValues(draft, catColId);
      const valValues = getColumnValues(draft, valColId);
      const lineSeries = catValues.map((cat, i) => ({
        label: cat,
        value: Number((valValues[i] ?? '0').replace(/,/g, '')) || 0,
      }));
      return { ...baseElement, lineSeries } as ReportElement;
    }

    if (mapping.visualization === 'table') {
      const allColumns: EvidenceColumn[] = draft.files
        .flatMap((file) => file.columns)
        .filter((col, i, arr) => arr.findIndex((c) => c.id === col.id) === i)
        .map((col) => ({ key: col.id, label: col.header }));
      const allRows = draft.files.flatMap((file) => file.previewRows);
      return {
        ...baseElement,
        tableColumns: allColumns,
        evidence: { ...evidence, table: { columns: allColumns, rows: allRows } },
      } as ReportElement;
    }

    // claim
    return {
      ...baseElement,
      caption: mapping.claimTemplate || `${mapping.label || 'This'} shows significant activity.`,
    } as ReportElement;
  });

  // Deduplicate element ids
  const seen = new Set<string>();
  for (const element of elements) {
    let id = element.id;
    let counter = 1;
    while (seen.has(id)) {
      id = `${element.id}-${counter}`;
      counter++;
    }
    seen.add(id);
  }

  const manifest: ReportManifest = {
    reportId,
    version: 1,
    title: draft.title,
    provider: draft.provider,
    client: draft.client,
    periodLabel: draft.periodLabel,
    publishedAt: now,
    recipient: draft.recipient,
    source: draft.source,
    elements,
  };

  // Validate the manifest before returning
  return parseManifest(manifest);
};
