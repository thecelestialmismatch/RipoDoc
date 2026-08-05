/**
 * Draft validation: returns a list of human-readable errors.
 *
 * A draft is only publishable when this list is empty. The validation is
 * purely structural — it does not re-run manifest validation (that happens in
 * draftToManifest via parseManifest). This catches authoring-time mistakes
 * before the user reaches the publish button.
 */

import type { FieldMapping, ReportDraft } from '@/lib/evidence/types.ts';

/** Return human-readable validation errors for a draft. Empty = valid. */
export const validateDraft = (draft: ReportDraft): readonly string[] => {
  const errors: string[] = [];

  if (!draft.title || draft.title.trim().length === 0) {
    errors.push('Report title is required.');
  }
  if (!draft.provider || draft.provider.trim().length === 0) {
    errors.push('Provider (MSP name) is required.');
  }
  if (!draft.client || draft.client.trim().length === 0) {
    errors.push('Client name is required.');
  }
  if (!draft.periodLabel || draft.periodLabel.trim().length === 0) {
    errors.push('Period label is required.');
  }

  if (!draft.recipient || !draft.recipient.name || !draft.recipient.email) {
    errors.push('A recipient (name and email) is required.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.recipient.email)) {
    errors.push('Recipient email is not a valid address.');
  }

  if (!draft.source || !draft.source.system || !draft.source.description) {
    errors.push('A data source declaration (system and description) is required.');
  } else {
    const parsed = Date.parse(draft.source.capturedAt);
    if (Number.isNaN(parsed)) {
      errors.push('Source capturedAt must be a valid ISO 8601 timestamp.');
    }
  }

  if (draft.files.length === 0) {
    errors.push('At least one data file must be uploaded.');
  }

  if (draft.mappings.length === 0) {
    errors.push('At least one field mapping is required before publishing.');
  }

  for (const mapping of draft.mappings) {
    const ctx = `Mapping "${mapping.label || mapping.id}"`;
    if (!mapping.label || mapping.label.trim().length === 0) {
      errors.push(`${ctx}: a display label is required.`);
    }
    if (['bar-chart', 'line-chart'].includes(mapping.visualization)) {
      if (!mapping.categoryColumnId) {
        errors.push(`${ctx}: a ${mapping.visualization} requires a category (x-axis) column.`);
      }
      if (!mapping.valueColumnId) {
        errors.push(`${ctx}: a ${mapping.visualization} requires a value (y-axis) column.`);
      }
    }
    if (mapping.visualization === 'claim' && !mapping.claimTemplate) {
      errors.push(`${ctx}: a claim requires a sentence template.`);
    }
  }

  return errors;
};

/** Check if a mapping references valid columns in the draft. */
export const isMappingValid = (mapping: FieldMapping, draft: ReportDraft): boolean => {
  const file = draft.files.find((f) => f.columns.some((c) => c.id === mapping.columnId));
  if (!file) return false;

  if (['bar-chart', 'line-chart'].includes(mapping.visualization)) {
    if (mapping.categoryColumnId && !file.columns.some((c) => c.id === mapping.categoryColumnId)) {
      return false;
    }
    if (mapping.valueColumnId && !file.columns.some((c) => c.id === mapping.valueColumnId)) {
      return false;
    }
  }

  return true;
};
