/**
 * Adobe Standard-14 font metrics for Helvetica and Helvetica-Bold.
 *
 * Needed because the layout engine centres KPI figures and right-aligns money
 * columns. Without real advance widths, a link annotation's rectangle drifts
 * away from the glyphs it is supposed to cover — and a click zone that misses
 * the chart is the one bug that makes the whole product look broken.
 *
 * Values are AFM advance widths in 1/1000 em, for WinAnsi code points 32..126.
 */

export type FontId = 'Helvetica' | 'Helvetica-Bold';

const HELVETICA_WIDTHS: readonly number[] = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

const HELVETICA_BOLD_WIDTHS: readonly number[] = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

const FIRST_CODE = 32;
const LAST_CODE = 126;
/** Fallback advance for anything outside the table (matches digit width). */
const FALLBACK_WIDTH = 556;

const widthTable = (font: FontId): readonly number[] =>
  font === 'Helvetica-Bold' ? HELVETICA_BOLD_WIDTHS : HELVETICA_WIDTHS;

/** Advance width of one code point, in 1/1000 em. */
export const glyphWidth = (font: FontId, codePoint: number): number => {
  if (codePoint < FIRST_CODE || codePoint > LAST_CODE) return FALLBACK_WIDTH;
  return widthTable(font)[codePoint - FIRST_CODE] ?? FALLBACK_WIDTH;
};

/** Width of `text` at `size` points. */
export const textWidth = (text: string, font: FontId, size: number): number => {
  let total = 0;
  for (const char of text) total += glyphWidth(font, char.codePointAt(0) ?? 0);
  return (total / 1000) * size;
};

/**
 * Truncate to `maxWidth`, appending an ellipsis when it does not fit.
 * Used for table cells: a client name must never overflow into the next column,
 * because a visually merged column reads as wrong data.
 */
export const truncateToWidth = (
  text: string,
  font: FontId,
  size: number,
  maxWidth: number,
): string => {
  if (textWidth(text, font, size) <= maxWidth) return text;
  const ellipsis = '...';
  const budget = maxWidth - textWidth(ellipsis, font, size);
  if (budget <= 0) return '';
  let out = '';
  for (const char of text) {
    if (textWidth(out + char, font, size) > budget) break;
    out += char;
  }
  return out.length > 0 ? `${out}${ellipsis}` : '';
};

/** Greedy word wrap. Returns at most `maxLines` lines, last one truncated. */
export const wrapText = (
  text: string,
  font: FontId,
  size: number,
  maxWidth: number,
  maxLines = Number.MAX_SAFE_INTEGER,
): readonly string[] => {
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current.length > 0 ? `${current} ${word}` : word;
    if (textWidth(candidate, font, size) <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current.length > 0) lines.push(current);
    current = word;
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && current.length > 0) lines.push(current);

  if (lines.length === 0) return [];
  if (lines.length < maxLines) return lines;

  const last = lines[maxLines - 1] ?? '';
  return [...lines.slice(0, maxLines - 1), truncateToWidth(last, font, size, maxWidth)];
};
