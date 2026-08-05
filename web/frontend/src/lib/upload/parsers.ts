/**
 * Client-side file parsers.
 *
 * Parses uploaded data files (CSV, TXT, XLSX) into a structured
 * ParsedSourceFile with column metadata and a preview of rows. This is the
 * "extract" step that feeds the field-mapping canvas.
 *
 * PDF, DOC/DOCX, and image files are accepted as uploads but parsed
 * separately — PDF extraction happens in the Go worker (pdfcpu + Textract),
 * and DOC/DOCX/images are handled server-side in the overlay pipeline.
 */

import { randomBytes } from 'node:crypto';
import { detectFormat } from './format.ts';
import { inferColumnType, sampleValues } from './infer.ts';
import type { ParsedSourceFile, SourceColumn, UploadFormat } from '@/lib/evidence/types.ts';

/** Maximum bytes to parse on the client. */
const MAX_PARSE_BYTES = 5 * 1024 * 1024; // 5 MB

/** Maximum rows to include in the preview. */
const PREVIEW_ROWS = 50;

/** Maximum columns to detect. */
const MAX_COLUMNS = 100;

/**
 * RFC 4180 CSV parser.
 * Handles quoted fields, escaped quotes ("" inside quoted fields),
 * CRLF and LF line endings, and trailing empty lines.
 */
export const parseCsv = (text: string): readonly (readonly string[])[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let hasData = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        hasData = true;
      } else if (char === ',') {
        row.push(field);
        field = '';
        hasData = true;
      } else if (char === '\r') {
        if (next === '\n') i++;
        if (hasData || row.length > 0) {
          row.push(field);
          rows.push(row);
          row = [];
          field = '';
          hasData = false;
        }
      } else if (char === '\n') {
        if (hasData || row.length > 0) {
          row.push(field);
          rows.push(row);
          row = [];
          field = '';
          hasData = false;
        }
      } else {
        field += char;
        hasData = true;
      }
    }
  }

  // Flush trailing data
  if (hasData || row.length > 0 || field.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
};

/**
 * Tab/pipe/comma-delimited plain text parser.
 * Auto-detects the delimiter from the first line by counting candidate delimiters.
 */
export const parseTxt = (text: string): readonly (readonly string[])[] => {
  const lines = text.split(/\r\n|\r|\n/).filter((line) => line.length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter: count occurrences in the first line
  const first = lines[0] ?? '';
  const delimiters = ['\t', '|', ';', ','];
  let bestDelim = '\t';
  let bestCount = 0;
  for (const delim of delimiters) {
    const count = (first.match(new RegExp(delim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? [])
      .length;
    if (count > bestCount) {
      bestCount = count;
      bestDelim = delim;
    }
  }

  if (bestCount === 0) {
    // Single column — treat each line as one cell
    return lines.map((line) => [line]);
  }

  const escaped = bestDelim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return lines.map((line) => {
    const cells = line.split(new RegExp(escaped, 'g'));
    // Pad short rows to match header length
    const headerLen = (lines[0] ?? '').split(new RegExp(escaped, 'g')).length;
    while (cells.length < headerLen) cells.push('');
    return cells;
  });
};

/**
 * Parse an XLSX file (via SheetJS dynamic import).
 * Returns rows of string values from the first sheet.
 */
export const parseXlsx = async (buffer: ArrayBuffer): Promise<readonly (readonly string[])[]> => {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(Buffer.from(buffer), { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];
  const sheet = workbook.Sheets[firstSheetName];
  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown as string[][];
  return rows.filter((row) => row.some((cell) => String(cell).trim() !== ''));
};

/**
 * Build a ParsedSourceFile from a 2D array of cells (rows × columns).
 * The first row is treated as the header.
 */
export const buildParsedSourceFile = (
  file: File,
  rows: readonly (readonly string[])[],
  format: UploadFormat,
  source: { system: string; description: string; capturedAt: string; method?: string },
): ParsedSourceFile => {
  const fileId = `file-${randomBytes(6).toString('hex')}`;

  const headerRow = rows[0] ?? [];
  const dataRows = rows.slice(1);

  // Build columns from the header
  const columns: SourceColumn[] = [];
  const columnCount = Math.min(Math.max(headerRow.length, 1), MAX_COLUMNS);

  for (let c = 0; c < columnCount; c++) {
    const header = (headerRow[c] ?? `Column ${c + 1}`).trim();
    const values = dataRows.map((row) => row[c] ?? '').filter((v) => v !== undefined);
    columns.push({
      id: `col-${c}`,
      header: header || `Column ${c + 1}`,
      dataType: inferColumnType(values),
      sampleValues: sampleValues(values),
    });
  }

  // Build preview rows (first 50 data rows)
  const previewRows: Readonly<Record<string, string>>[] = dataRows.slice(0, PREVIEW_ROWS).map((row) => {
    const record: Record<string, string> = {};
    for (let c = 0; c < columnCount; c++) {
      const key = columns[c]?.id ?? `col-${c}`;
      record[key] = row[c] ?? '';
    }
    return record;
  });

  return {
    fileId,
    fileName: file.name,
    format,
    sizeBytes: file.size,
    columns,
    previewRows,
    rowCount: dataRows.length,
    source: {
      system: source.system,
      description: source.description,
      ...(source.method ? { method: source.method } : {}),
      capturedAt: source.capturedAt,
    },
  };
};

/**
 * Dispatch a File to the appropriate parser.
 * Returns a ParsedSourceFile for CSV/TXT/XLSX.
 * PDF/DOC/DOCX/image files are returned with metadata but no parsed columns
 * (extraction happens in the overlay/Go pipeline).
 */
export const parseFile = async (
  file: File,
  source: { system: string; description: string; capturedAt: string; method?: string },
): Promise<ParsedSourceFile | null> => {
  const format = detectFormat(file);
  if (format === null) return null;

  if (file.size > MAX_PARSE_BYTES) return null;

  if (format === 'pdf' || ['doc', 'docx', 'png', 'jpg', 'jpeg'].includes(format)) {
    // For binary formats, return metadata-only with a single placeholder column.
    // Real extraction happens in the overlay pipeline (pdfcpu/Textract).
    return {
      fileId: `file-${randomBytes(6).toString('hex')}`,
      fileName: file.name,
      format,
      sizeBytes: file.size,
      columns: [
        {
          id: 'col-0',
          header: file.name,
          dataType: 'string',
          sampleValues: [formatLabel(format)],
        },
      ],
      previewRows: [],
      rowCount: 0,
      source: {
        system: source.system,
        description: source.description,
        ...(source.method ? { method: source.method } : {}),
        capturedAt: source.capturedAt,
      },
    };
  }

  if (format === 'xlsx') {
    const buffer = await file.arrayBuffer();
    const rows = await parseXlsx(buffer);
    return buildParsedSourceFile(file, rows, format, source);
  }

  // CSV and TXT
  const text = await file.text();
  const rows = format === 'csv' ? parseCsv(text) : parseTxt(text);
  return buildParsedSourceFile(file, rows, format, source);
};

const formatLabel = (format: UploadFormat): string => {
  const labels: Record<UploadFormat, string> = {
    pdf: 'PDF document',
    doc: 'Word document',
    docx: 'Word document',
    csv: 'CSV spreadsheet',
    xlsx: 'Excel workbook',
    txt: 'Text file',
    png: 'PNG image',
    jpg: 'JPEG image',
    jpeg: 'JPEG image',
  };
  return labels[format];
};
