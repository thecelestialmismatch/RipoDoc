/**
 * The placement plan: proposal → human review → published overlay.
 *
 * A placement file is the reviewable artifact between the two. It is bound to
 * one exact PDF by SHA-256, because a reviewer approving "the box around 97.4%
 * on page 2" approved it *for that document*. Re-using those coordinates
 * against a re-exported PDF, where a paragraph reflowed and everything below
 * moved 12 points, would put the link on the wrong number — silently.
 *
 * That is the whole reason this file exists rather than a pair of coordinates
 * passed on the command line.
 */

import { createHash } from 'node:crypto';
import type { ReportManifest } from '../../../../web/frontend/src/lib/evidence/types.ts';
import { asName, dictGet, isDictLike, type PdfObject } from './objects.ts';
import { visualRectToUser, type UserRect, type VisualRect } from './geometry.ts';
import { locatePlacements, type LocateOptions, type LocateReport } from './locate.ts';
import { PdfReader } from './reader.ts';
import { appendLinkAnnotations, type AppendResult, type LinkAnnotation } from './writer.ts';

export interface ReviewedPlacement {
  readonly elementId: string;
  /** 1-based, as a human counts pages. */
  readonly page: number;
  /** Top-left origin, points, in the space the reader sees. */
  readonly rect: VisualRect;
  readonly matchedText?: string;
  /** Present once a person has signed off on this zone. */
  readonly approvedBy?: string;
  readonly approvedAt?: string;
  readonly note?: string;
}

export interface PlacementFile {
  readonly reportId: string;
  readonly version: number;
  /** SHA-256 of the exact PDF these coordinates were reviewed against. */
  readonly pdfSha256: string;
  readonly generatedAt: string;
  readonly placements: readonly ReviewedPlacement[];
  /** Elements a human still has to disambiguate. */
  readonly needsReview?: ReadonlyArray<{
    readonly elementId: string;
    readonly candidates: readonly ReviewedPlacement[];
  }>;
  readonly unmatched?: readonly string[];
}

export const sha256 = (bytes: Buffer): string =>
  createHash('sha256').update(bytes).digest('hex');

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const parseRect = (value: unknown, where: string): VisualRect => {
  if (typeof value !== 'object' || value === null) {
    throw new Error(`${where}: rect must be an object`);
  }
  const rect = value as Record<string, unknown>;
  const { x, y, width, height } = rect;
  if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(width) || !isFiniteNumber(height)) {
    throw new Error(`${where}: rect needs finite x, y, width and height`);
  }
  if (width <= 0 || height <= 0) throw new Error(`${where}: rect must have a positive area`);
  return { x, y, width, height };
};

/** Parse and validate a placement file. Fails closed on anything unexpected. */
export const parsePlacementFile = (input: unknown): PlacementFile => {
  if (typeof input !== 'object' || input === null) throw new Error('Placement file must be an object');
  const raw = input as Record<string, unknown>;
  const { reportId, version, pdfSha256, generatedAt, placements } = raw;

  if (typeof reportId !== 'string' || reportId.length === 0) {
    throw new Error('Placement file: reportId is required');
  }
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    throw new Error('Placement file: version must be a positive integer');
  }
  if (typeof pdfSha256 !== 'string' || !/^[0-9a-f]{64}$/.test(pdfSha256)) {
    throw new Error('Placement file: pdfSha256 must be 64 lowercase hex characters');
  }
  if (!Array.isArray(placements) || placements.length === 0) {
    throw new Error('Placement file: at least one placement is required');
  }

  const parsed = placements.map((entry, index) => {
    const where = `Placement ${index + 1}`;
    if (typeof entry !== 'object' || entry === null) throw new Error(`${where}: must be an object`);
    const item = entry as Record<string, unknown>;
    if (typeof item.elementId !== 'string' || item.elementId.length === 0) {
      throw new Error(`${where}: elementId is required`);
    }
    if (!isFiniteNumber(item.page) || !Number.isInteger(item.page) || item.page < 1) {
      throw new Error(`${where}: page must be a positive integer (1-based)`);
    }
    return {
      elementId: item.elementId,
      page: item.page,
      rect: parseRect(item.rect, where),
      ...(typeof item.matchedText === 'string' ? { matchedText: item.matchedText } : {}),
      ...(typeof item.approvedBy === 'string' ? { approvedBy: item.approvedBy } : {}),
      ...(typeof item.approvedAt === 'string' ? { approvedAt: item.approvedAt } : {}),
      ...(typeof item.note === 'string' ? { note: item.note } : {}),
    } satisfies ReviewedPlacement;
  });

  return {
    reportId,
    version,
    pdfSha256,
    generatedAt: typeof generatedAt === 'string' ? generatedAt : new Date(0).toISOString(),
    placements: parsed,
  };
};

const toReviewed = (
  candidate: { elementId: string; pageIndex: number; visual: VisualRect; matchedText: string },
  note?: string,
): ReviewedPlacement => ({
  elementId: candidate.elementId,
  page: candidate.pageIndex + 1,
  rect: {
    x: Math.round(candidate.visual.x * 100) / 100,
    y: Math.round(candidate.visual.y * 100) / 100,
    width: Math.round(candidate.visual.width * 100) / 100,
    height: Math.round(candidate.visual.height * 100) / 100,
  },
  matchedText: candidate.matchedText,
  ...(note ? { note } : {}),
});

/** Run detection and package the result as a reviewable placement file. */
export const proposePlacements = (
  reader: PdfReader,
  manifest: ReportManifest,
  pdfBytes: Buffer,
  options: LocateOptions = {},
): { file: PlacementFile; report: LocateReport } => {
  const report = locatePlacements(reader, manifest, options);
  const file: PlacementFile = {
    reportId: manifest.reportId,
    version: manifest.version,
    pdfSha256: sha256(pdfBytes),
    generatedAt: manifest.publishedAt,
    placements: report.matched.map((candidate) =>
      toReviewed(candidate, `auto-detected, score ${candidate.score.toFixed(2)}`),
    ),
    needsReview: report.ambiguous.map((entry) => ({
      elementId: entry.elementId,
      candidates: entry.candidates.map((candidate) =>
        toReviewed(candidate, `score ${candidate.score.toFixed(2)} — ${candidate.reasons.join('; ')}`),
      ),
    })),
    unmatched: report.unmatched,
  };
  return { file, report };
};

export interface OverlayInput {
  readonly pdfBytes: Buffer;
  readonly manifest: ReportManifest;
  readonly placements: readonly ReviewedPlacement[];
  /** `https://host/e/<token>`; the element id is appended. */
  readonly baseUrl: string;
  readonly allowLoopbackHttp?: boolean;
  /** Skip the "a human approved this" gate. Prints a warning at the call site. */
  readonly allowUnreviewed?: boolean;
  /** Permit publishing with some elements unlinked. */
  readonly allowPartial?: boolean;
}

export interface OverlayOutcome extends AppendResult {
  readonly links: readonly LinkAnnotation[];
  readonly coveredElements: readonly string[];
  readonly uncoveredElements: readonly string[];
}

/**
 * Turn approved placements into a clickable PDF.
 *
 * Every failure here is a refusal to publish. A report that reaches a client
 * with one dead figure costs more trust than a build that stopped.
 */
export const overlayEvidenceLinks = (input: OverlayInput): OverlayOutcome => {
  const reader = PdfReader.open(input.pdfBytes);
  const known = new Map(input.manifest.elements.map((element) => [element.id, element]));

  const links: LinkAnnotation[] = [];
  const covered = new Set<string>();

  for (const placement of input.placements) {
    if (!known.has(placement.elementId)) {
      throw new Error(
        `Placement references "${placement.elementId}", which is not an element of ` +
          `report ${input.manifest.reportId} v${input.manifest.version}`,
      );
    }
    const page = reader.pages[placement.page - 1];
    if (!page) {
      throw new Error(
        `Placement for "${placement.elementId}" targets page ${placement.page}, ` +
          `but the PDF has ${reader.pages.length} page(s)`,
      );
    }
    if (input.allowUnreviewed !== true && !placement.approvedBy) {
      throw new Error(
        `Placement for "${placement.elementId}" has no approvedBy. ` +
          'Evidence zones are approved by a person before publication.',
      );
    }

    links.push({
      pageIndex: placement.page - 1,
      rect: visualRectToUser(page, placement.rect),
      uri: `${input.baseUrl.replace(/\/$/, '')}/${placement.elementId}`,
    });
    covered.add(placement.elementId);
  }

  const uncovered = input.manifest.elements
    .map((element) => element.id)
    .filter((id) => !covered.has(id));
  if (uncovered.length > 0 && input.allowPartial !== true) {
    throw new Error(
      `No placement for: ${uncovered.join(', ')}. ` +
        'A report where one figure is not clickable looks broken to the client; ' +
        'pass --allow-partial to publish anyway.',
    );
  }

  const appended = appendLinkAnnotations(reader, links, {
    ...(input.allowLoopbackHttp === true ? { allowLoopbackHttp: true } : {}),
    idSeed: `${input.manifest.reportId}:${input.manifest.version}`,
  });

  return {
    ...appended,
    links,
    coveredElements: [...covered],
    uncoveredElements: uncovered,
  };
};

export interface ExtractedLink {
  readonly page: number;
  readonly uri: string;
  readonly rect: UserRect;
}

/**
 * Read the evidence links back out of a produced file.
 *
 * The post-condition that matters is not "we wrote N annotations" but "a reader
 * starting from the trailer of the finished file finds N annotations on the
 * right pages". This re-parses the output from scratch to check exactly that.
 */
export const readEvidenceLinks = (bytes: Buffer): readonly ExtractedLink[] => {
  const reader = PdfReader.open(bytes);
  const found: ExtractedLink[] = [];

  for (const page of reader.pages) {
    const annots = reader.resolve(page.dict.map.get('Annots'));
    if (annots?.kind !== 'array') continue;
    for (const item of annots.items) {
      const annot = reader.resolve(item);
      if (!isDictLike(annot)) continue;
      if (asName(reader.resolve(annot.map.get('Subtype'))) !== 'Link') continue;
      const action = reader.resolve(annot.map.get('A'));
      if (asName(reader.resolve(dictGet(action, 'S'))) !== 'URI') continue;
      const uri = reader.resolve(dictGet(action, 'URI'));
      if (uri?.kind !== 'str') continue;
      found.push({
        page: page.index + 1,
        uri: uri.bytes.toString('latin1'),
        rect: rectOf(reader.resolve(annot.map.get('Rect'))),
      });
    }
  }

  return found;
};

const rectOf = (value: PdfObject | undefined): UserRect => {
  if (value?.kind !== 'array' || value.items.length < 4) return [0, 0, 0, 0];
  const numbers = value.items.map((item) => (item.kind === 'num' ? item.value : 0));
  return [numbers[0] ?? 0, numbers[1] ?? 0, numbers[2] ?? 0, numbers[3] ?? 0];
};
