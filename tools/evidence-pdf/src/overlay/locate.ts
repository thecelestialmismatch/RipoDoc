/**
 * Finding each figure on the page — the proposal step.
 *
 * Given a report manifest and an uploaded PDF, this decides *where* every
 * element's click zone should go. It is a heuristic, and it is treated as one:
 * the output is a **proposal for a human to approve**, never a placement that
 * ships unreviewed. `docs/02-product/interaction-spec.md` §"Determinism" is the
 * rule this implements — a machine may suggest, a person approves, publication
 * freezes the result.
 *
 * The failure this design is built around: `14` appears three times on a
 * typical QBR page — once as the headline figure and twice inside `148` and
 * `143` on a chart axis. Picking the wrong one produces a report where a
 * client clicks "assets at risk" and is shown April's ticket count. So a
 * candidate is scored on evidence, and when the top two are close the element
 * is reported as **ambiguous** rather than guessed.
 */

import type { ReportElement, ReportManifest } from '../../../../web/frontend/src/lib/evidence/types.ts';
import { clampToPage, padUserRect, userRectToVisual, type UserRect, type VisualRect } from './geometry.ts';
import type { PdfPage, PdfReader } from './reader.ts';
import { extractTextLines, rectForSubstring, type TextLine } from './text.ts';

export interface PlacementCandidate {
  readonly elementId: string;
  readonly pageIndex: number;
  readonly rect: UserRect;
  /** The same zone in the space a human sees, for review. */
  readonly visual: VisualRect;
  readonly matchedText: string;
  readonly lineText: string;
  readonly score: number;
  readonly reasons: readonly string[];
}

export interface LocateReport {
  readonly matched: readonly PlacementCandidate[];
  readonly ambiguous: ReadonlyArray<{
    readonly elementId: string;
    readonly candidates: readonly PlacementCandidate[];
  }>;
  readonly unmatched: readonly string[];
}

/**
 * Normalise text for comparison, keeping a map back to original indices.
 *
 * Producers emit non-breaking and thin spaces inside numbers, and typographic
 * minus signs where the manifest has a hyphen. Matching the raw strings misses
 * figures that are plainly identical on screen.
 */
const normalise = (input: string): { text: string; map: readonly number[] } => {
  let text = '';
  const map: number[] = [];
  let lastWasSpace = false;
  for (let index = 0; index < input.length; index += 1) {
    let char = input[index] ?? '';
    if (/[\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000\t]/.test(char)) char = ' ';
    if (/[\u2212\u2013\u2014\u2010\u2011]/.test(char)) char = '-';
    if (char === ' ') {
      if (lastWasSpace) continue;
      lastWasSpace = true;
    } else {
      lastWasSpace = false;
    }
    text += char;
    map.push(index);
  }
  return { text: text.toLowerCase(), map };
};

const isWordChar = (char: string | undefined): boolean =>
  char !== undefined && /[0-9a-z%$£€.]/i.test(char);

/** What text identifies this element on the page. */
export const locatorFor = (element: ReportElement): readonly string[] => {
  const candidates: string[] = [];
  if (element.kind === 'kpi' && element.value) candidates.push(element.value);
  candidates.push(element.label);
  if (element.value) candidates.push(element.value);
  if (element.caption) candidates.push(element.caption);
  return [...new Set(candidates.filter((value) => value.trim().length > 0))];
};

/**
 * Edge-to-edge distance, not centre-to-centre.
 *
 * A label line spans the full column — "Tickets resolved   SLA attainment
 * Assets at risk" is one line — so its centre sits nowhere near any of the
 * three figures it labels. Measuring between centres therefore ranks a
 * neighbouring paragraph above the figure directly under the label. Edge
 * distance is zero when the figure sits inside or immediately beside its
 * label, which is what "near" actually means on a page.
 */
const distance = (a: UserRect, b: UserRect): number => {
  const dx = Math.max(0, a[0] - b[2], b[0] - a[2]);
  const dy = Math.max(0, a[1] - b[3], b[1] - a[3]);
  return Math.hypot(dx, dy);
};

interface Occurrence {
  readonly line: TextLine;
  readonly rect: UserRect;
  readonly matchedText: string;
  readonly wholeLine: boolean;
  readonly bounded: boolean;
}

/**
 * Is this match a standalone token?
 *
 * Character-level neighbours are the first test — `14` inside `148` is not a
 * standalone figure. But whitespace is not always present between two visually
 * separate items: adjacent table cells often produce no space character at all,
 * which would make a headline KPI look like part of the number beside it. So a
 * clear horizontal gap counts as a boundary too.
 */
const isStandalone = (line: TextLine, start: number, end: number): boolean => {
  const glyphIndices: number[] = [];
  for (let index = start; index < end; index += 1) {
    const glyph = line.charGlyph[index];
    if (glyph !== undefined && glyph >= 0) glyphIndices.push(glyph);
  }
  const first = glyphIndices[0];
  const last = glyphIndices[glyphIndices.length - 1];
  if (first === undefined || last === undefined) return false;

  const threshold = 0.12 * Math.max(line.size, 1);
  const gapBefore = (): number => {
    const previous = line.glyphs[first - 1];
    const current = line.glyphs[first];
    if (!previous || !current) return Number.POSITIVE_INFINITY;
    return current.along - (previous.along + previous.advance);
  };
  const gapAfter = (): number => {
    const next = line.glyphs[last + 1];
    const current = line.glyphs[last];
    if (!next || !current) return Number.POSITIVE_INFINITY;
    return next.along - (current.along + current.advance);
  };

  const { text } = normalise(line.text);
  const leftClear = !isWordChar(text[start - 1]) || gapBefore() > threshold;
  const rightClear = !isWordChar(text[end]) || gapAfter() > threshold;
  return leftClear && rightClear;
};

const findOccurrences = (lines: readonly TextLine[], needle: string): readonly Occurrence[] => {
  const target = normalise(needle).text.trim();
  if (target.length === 0) return [];
  const found: Occurrence[] = [];

  for (const line of lines) {
    const { text, map } = normalise(line.text);
    let from = 0;
    for (;;) {
      const at = text.indexOf(target, from);
      if (at < 0) break;
      from = at + 1;
      const originalStart = map[at] ?? 0;
      const originalEnd = (map[at + target.length - 1] ?? originalStart) + 1;
      const rect = rectForSubstring(line, originalStart, originalEnd);
      if (!rect) continue;
      found.push({
        line,
        rect,
        matchedText: line.text.slice(originalStart, originalEnd),
        wholeLine: text.trim() === target,
        bounded: isStandalone(line, originalStart, originalEnd),
      });
    }
  }

  return found;
};

/** Lines whose text contains the element's label — the proximity anchor. */
const labelRects = (lines: readonly TextLine[], label: string): readonly UserRect[] => {
  const target = normalise(label).text.trim();
  if (target.length < 3) return [];
  return lines.filter((line) => normalise(line.text).text.includes(target)).map((line) => line.rect);
};

const scoreOccurrence = (
  element: ReportElement,
  occurrence: Occurrence,
  anchors: readonly UserRect[],
): { score: number; reasons: string[] } => {
  const reasons: string[] = [];
  let score = 1;

  if (occurrence.bounded) {
    score += 0.6;
    reasons.push('stands alone rather than inside a longer number');
  } else {
    reasons.push('appears inside a longer run of characters');
  }
  if (occurrence.wholeLine) {
    score += 0.4;
    reasons.push('occupies the whole text line');
  }

  if (anchors.length > 0) {
    const nearest = Math.min(...anchors.map((anchor) => distance(anchor, occurrence.rect)));
    const proximity = 1.2 / (1 + nearest / 60);
    score += proximity;
    reasons.push(`${nearest.toFixed(0)}pt from the label "${element.label}"`);
  }

  if (element.kind === 'kpi') {
    const emphasis = Math.min(occurrence.line.size / 24, 1) * 0.6;
    score += emphasis;
    reasons.push(`set at ${occurrence.line.size.toFixed(1)}pt`);
  }

  return { score, reasons };
};

export interface LocateOptions {
  /** Extra points added around a detected zone. */
  readonly padding?: number;
  /** Below this gap between the top two candidates, ask a human. */
  readonly ambiguityMargin?: number;
}

/** Propose one placement per element. */
export const locatePlacements = (
  reader: PdfReader,
  manifest: ReportManifest,
  options: LocateOptions = {},
): LocateReport => {
  const ambiguityMargin = options.ambiguityMargin ?? 0.25;
  const pages = reader.pages;
  const linesByPage = new Map<number, readonly TextLine[]>();
  for (const page of pages) linesByPage.set(page.index, extractTextLines(reader, page));

  const matched: PlacementCandidate[] = [];
  const ambiguous: Array<{ elementId: string; candidates: PlacementCandidate[] }> = [];
  const unmatched: string[] = [];

  for (const element of manifest.elements) {
    // Locators are a fallback chain, not a pool. If the KPI's own figure is on
    // the page, that is the zone — the element's label is a *fallback* for when
    // the figure cannot be found, and letting the two compete produces the
    // absurd outcome where a card's caption outranks the number it captions.
    let candidates: PlacementCandidate[] = [];
    for (const needle of locatorFor(element)) {
      for (const page of pages) {
        const lines = linesByPage.get(page.index) ?? [];
        const anchors = labelRects(lines, element.label);
        for (const occurrence of findOccurrences(lines, needle)) {
          const { score, reasons } = scoreOccurrence(element, occurrence, anchors);
          candidates.push({
            elementId: element.id,
            pageIndex: page.index,
            ...zoneFor(page, occurrence.rect, options.padding),
            matchedText: occurrence.matchedText,
            lineText: occurrence.line.text,
            score,
            reasons,
          });
        }
      }
      if (candidates.length > 0) break;
      candidates = [];
    }

    const ranked = dedupe(candidates).sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const runnerUp = ranked[1];
    if (!best) {
      unmatched.push(element.id);
      continue;
    }
    if (runnerUp && best.score - runnerUp.score < ambiguityMargin) {
      ambiguous.push({ elementId: element.id, candidates: ranked.slice(0, 4) });
      continue;
    }
    matched.push(best);
  }

  return { matched, ambiguous, unmatched };
};

/** Two locators hitting the same glyphs must not look like two candidates. */
const dedupe = (candidates: readonly PlacementCandidate[]): PlacementCandidate[] => {
  const best = new Map<string, PlacementCandidate>();
  for (const candidate of candidates) {
    const key = `${candidate.pageIndex}:${candidate.rect.map((value) => value.toFixed(1)).join(',')}`;
    const existing = best.get(key);
    if (!existing || candidate.score > existing.score) best.set(key, candidate);
  }
  return [...best.values()];
};

const zoneFor = (
  page: PdfPage,
  rect: UserRect,
  padding: number | undefined,
): { rect: UserRect; visual: VisualRect } => {
  const grown = clampToPage(page, padUserRect(rect, padding ?? 2));
  return { rect: grown, visual: userRectToVisual(page, grown) };
};
