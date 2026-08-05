/**
 * Column type inference and value sampling.
 *
 * Given the raw string values from a parsed file, infer the most likely data
 * type using a majority vote over non-empty values. This is deliberately
 * heuristic — the author can override in the mapping step, and every value is
 * always shown in the preview table as plain text.
 */

/** RFC 2822 / ISO date regex — catches the common formats in CSV exports. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:?\d{2})?)?$/;
const US_DATE = /^\d{1,2}\/\d{1,2}\/\d{4}(\s+\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM))?$/;
const RFC_DATE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([.,]\d+)?(Z|[+-]\d{2}:?\d{2})$|^\d{4}-\d{2}-\d{2}$/;

const isDate = (value: string): boolean =>
  ISO_DATE.test(value) || US_DATE.test(value) || RFC_DATE.test(value);

const isNumber = (value: string): boolean => {
  if (value.trim() === '') return false;
  const n = Number(value.replace(/,/g, ''));
  return !Number.isNaN(n) && Number.isFinite(n);
};

const isBoolean = (value: string): boolean => {
  const v = value.trim().toLowerCase();
  return v === 'true' || v === 'false' || v === 'yes' || v === 'no' || v === '0' || v === '1';
};

/** Infer the type of a single value. */
const classify = (value: string): 'number' | 'date' | 'boolean' | 'string' => {
  if (value.trim() === '') return 'string';
  if (isBoolean(value)) return 'boolean';
  if (isNumber(value)) return 'number';
  if (isDate(value)) return 'date';
  return 'string';
};

/**
 * Majority-vote type inference over non-empty values.
 * If there's a tie, the first-encountered type wins.
 */
export const inferColumnType = (
  values: readonly string[],
): 'string' | 'number' | 'date' | 'boolean' => {
  const counts: Record<string, number> = {};
  let first: string | undefined;
  let tie = true;

  for (const value of values) {
    if (value.trim() === '') continue;
    const type = classify(value);
    counts[type] = (counts[type] ?? 0) + 1;
    if (first === undefined) first = type;
    if (!tie) continue;
    if (counts[type] !== counts[first]) tie = false;
  }

  const best = (first ?? 'string') as string;
  for (const [type, count] of Object.entries(counts)) {
    if (count > (counts[best] ?? 0)) {
      return type as 'string' | 'number' | 'date' | 'boolean';
    }
  }
  return best as 'string' | 'number' | 'date' | 'boolean';
};

/**
 * Return the first N non-empty, unique sample values from a column.
 * Capped at `max` (default 5).
 */
export const sampleValues = (
  values: readonly string[],
  max = 5,
): readonly string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const v = value.trim();
    if (v === '') continue;
    if (seen.has(v)) continue;
    seen.add(v);
    result.push(v);
    if (result.length >= max) break;
  }
  return result;
};
