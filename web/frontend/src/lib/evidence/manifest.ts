/**
 * Manifest validation.
 *
 * A manifest is a system boundary: it arrives as JSON from the authoring
 * pipeline and drives both the PDF and the evidence pages. Anything malformed
 * must fail here, loudly, rather than surface as a broken click zone or — far
 * worse — an element rendered without its approval provenance.
 */

import type {
  EvidenceCell,
  EvidenceColumn,
  EvidenceDetail,
  ReportElement,
  ReportManifest,
} from './types.ts';

export class ManifestError extends Error {
  readonly path: string;

  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = 'ManifestError';
    this.path = path;
  }
}

/** Element ids appear in URLs; keep them boring and unambiguous. */
const ELEMENT_ID = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const requireString = (value: unknown, path: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ManifestError(path, 'expected a non-empty string');
  }
  return value;
};

const requireIso = (value: unknown, path: string): string => {
  const text = requireString(value, path);
  if (Number.isNaN(Date.parse(text))) {
    throw new ManifestError(path, 'expected an ISO 8601 timestamp');
  }
  return text;
};

const requireArray = (value: unknown, path: string): readonly unknown[] => {
  if (!Array.isArray(value)) throw new ManifestError(path, 'expected an array');
  return value;
};

const parseColumns = (value: unknown, path: string): readonly EvidenceColumn[] => {
  const items = requireArray(value, path);
  if (items.length === 0) throw new ManifestError(path, 'needs at least one column');
  return items.map((item, index) => {
    const at = `${path}[${index}]`;
    if (!isRecord(item)) throw new ManifestError(at, 'expected an object');
    const align = item.align;
    if (align !== undefined && align !== 'left' && align !== 'right') {
      throw new ManifestError(`${at}.align`, 'expected "left" or "right"');
    }
    return {
      key: requireString(item.key, `${at}.key`),
      label: requireString(item.label, `${at}.label`),
      ...(align !== undefined ? { align } : {}),
    };
  });
};

const parseRows = (
  value: unknown,
  columns: readonly EvidenceColumn[],
  path: string,
): readonly Readonly<Record<string, EvidenceCell>>[] => {
  const items = requireArray(value, path);
  return items.map((item, index) => {
    const at = `${path}[${index}]`;
    if (!isRecord(item)) throw new ManifestError(at, 'expected an object');
    const row: Record<string, EvidenceCell> = {};
    for (const column of columns) {
      const cell = item[column.key];
      if (typeof cell !== 'string' && typeof cell !== 'number') {
        throw new ManifestError(`${at}.${column.key}`, 'expected a string or number');
      }
      row[column.key] = cell;
    }
    return row;
  });
};

const parseEvidence = (value: unknown, path: string): EvidenceDetail => {
  if (!isRecord(value)) throw new ManifestError(path, 'expected an object');
  const table = value.table;
  if (!isRecord(table)) throw new ManifestError(`${path}.table`, 'expected an object');
  const provenance = value.provenance;
  if (!isRecord(provenance)) {
    throw new ManifestError(`${path}.provenance`, 'expected an object');
  }

  const columns = parseColumns(table.columns, `${path}.table.columns`);
  return {
    title: requireString(value.title, `${path}.title`),
    summary: requireString(value.summary, `${path}.summary`),
    table: { columns, rows: parseRows(table.rows, columns, `${path}.table.rows`) },
    provenance: {
      sourceSystem: requireString(provenance.sourceSystem, `${path}.provenance.sourceSystem`),
      sourceQuery: requireString(provenance.sourceQuery, `${path}.provenance.sourceQuery`),
      approvedBy: requireString(provenance.approvedBy, `${path}.provenance.approvedBy`),
      approvedAt: requireIso(provenance.approvedAt, `${path}.provenance.approvedAt`),
    },
  };
};

const parseElement = (value: unknown, path: string): ReportElement => {
  if (!isRecord(value)) throw new ManifestError(path, 'expected an object');

  const id = requireString(value.id, `${path}.id`);
  if (!ELEMENT_ID.test(id)) {
    throw new ManifestError(`${path}.id`, 'must be lowercase alphanumeric with hyphens, 3-64 chars');
  }

  const kind = value.kind;
  if (kind !== 'kpi' && kind !== 'bar-chart' && kind !== 'claim') {
    throw new ManifestError(`${path}.kind`, 'expected "kpi", "bar-chart" or "claim"');
  }

  let series: readonly { label: string; value: number }[] | undefined;
  if (kind === 'bar-chart') {
    const items = requireArray(value.series, `${path}.series`);
    if (items.length === 0) throw new ManifestError(`${path}.series`, 'needs at least one bar');
    series = items.map((item, index) => {
      const at = `${path}.series[${index}]`;
      if (!isRecord(item)) throw new ManifestError(at, 'expected an object');
      if (typeof item.value !== 'number' || !Number.isFinite(item.value)) {
        throw new ManifestError(`${at}.value`, 'expected a finite number');
      }
      if (item.value < 0) throw new ManifestError(`${at}.value`, 'must not be negative');
      return { label: requireString(item.label, `${at}.label`), value: item.value };
    });
  }

  if (kind === 'kpi' && typeof value.value !== 'string') {
    throw new ManifestError(`${path}.value`, 'kpi elements need a pre-formatted value string');
  }

  return {
    id,
    kind,
    label: requireString(value.label, `${path}.label`),
    ...(typeof value.value === 'string' ? { value: value.value } : {}),
    ...(typeof value.caption === 'string' ? { caption: value.caption } : {}),
    ...(series ? { series } : {}),
    evidence: parseEvidence(value.evidence, `${path}.evidence`),
  };
};

/** Parse and validate a manifest. Throws `ManifestError` on the first problem. */
export const parseManifest = (value: unknown): ReportManifest => {
  if (!isRecord(value)) throw new ManifestError('$', 'expected an object');

  const version = value.version;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    throw new ManifestError('$.version', 'expected a positive integer');
  }

  const recipient = value.recipient;
  if (!isRecord(recipient)) throw new ManifestError('$.recipient', 'expected an object');
  const email = requireString(recipient.email, '$.recipient.email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ManifestError('$.recipient.email', 'expected a valid email address');
  }

  const rawElements = requireArray(value.elements, '$.elements');
  if (rawElements.length === 0) {
    throw new ManifestError('$.elements', 'a report needs at least one element');
  }
  const elements = rawElements.map((item, index) => parseElement(item, `$.elements[${index}]`));

  const seen = new Set<string>();
  for (const element of elements) {
    if (seen.has(element.id)) {
      throw new ManifestError('$.elements', `duplicate element id "${element.id}"`);
    }
    seen.add(element.id);
  }

  return {
    reportId: requireString(value.reportId, '$.reportId'),
    version,
    title: requireString(value.title, '$.title'),
    provider: requireString(value.provider, '$.provider'),
    client: requireString(value.client, '$.client'),
    periodLabel: requireString(value.periodLabel, '$.periodLabel'),
    publishedAt: requireIso(value.publishedAt, '$.publishedAt'),
    recipient: { name: requireString(recipient.name, '$.recipient.name'), email },
    elements,
  };
};
