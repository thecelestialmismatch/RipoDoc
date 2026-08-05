/**
 * Format detection for uploaded files.
 *
 * Maps a File object to a known UploadFormat by checking MIME type and file
 * extension. Returns `null` for unsupported types so the UI can reject them
 * before parsing.
 */

import type { UploadFormat } from '@/lib/evidence/types.ts';

/** Map of MIME type → format, for the types we support. */
const MIME_FORMAT: Readonly<Record<string, UploadFormat>> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/csv': 'csv',
  'application/vnd.ms-excel': 'xlsx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/plain': 'txt',
  'image/png': 'png',
  'image/jpeg': 'jpeg',
};

/** Map of extension → format. */
const EXT_FORMAT: Readonly<Record<string, UploadFormat>> = {
  pdf: 'pdf',
  doc: 'doc',
  docx: 'docx',
  csv: 'csv',
  xlsx: 'xlsx',
  xls: 'xlsx',
  txt: 'txt',
  png: 'png',
  jpg: 'jpeg',
  jpeg: 'jpeg',
};

const getExtension = (name: string): string => {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
};

/** Detect format from a File object. Returns null for unsupported types. */
export const detectFormat = (file: File): UploadFormat | null => {
  const byMime = MIME_FORMAT[file.type];
  if (byMime) return byMime;
  return EXT_FORMAT[getExtension(file.name)] ?? null;
};

/** Check if a filename is a supported format. */
export const isSupportedFormat = (name: string): boolean =>
  Object.prototype.hasOwnProperty.call(EXT_FORMAT, getExtension(name));

/** Human-readable label for a format. */
export const formatLabel = (format: UploadFormat): string => {
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
