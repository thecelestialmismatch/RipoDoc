/**
 * Page geometry: the arithmetic between "where the number appears on screen"
 * and "where the annotation rectangle goes".
 *
 * Two conversions are easy to get subtly wrong, and both produce the same
 * symptom — a click zone that sits near the figure instead of on it:
 *
 *  - **Origin.** PDF user space starts bottom-left; every human placing a box
 *    thinks top-left.
 *  - **`/Rotate`.** A page can declare a display rotation. The bytes are
 *    unrotated; the viewer turns them. A rectangle authored against what the
 *    author *saw* must be rotated back before it is written.
 *
 * `/CropBox` is the visible area, so it — not `/MediaBox` — is the frame an
 * author measures against. Scanned reports frequently crop.
 */

import type { PdfPage, PdfRect } from './reader.ts';

/** Top-left origin, in points, in the space the reader actually sees. */
export interface VisualRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** `[x0, y0, x1, y1]` in PDF user space. */
export type UserRect = readonly [number, number, number, number];

export interface VisualSize {
  readonly width: number;
  readonly height: number;
}

const boxWidth = (box: PdfRect): number => box.urx - box.llx;
const boxHeight = (box: PdfRect): number => box.ury - box.lly;

/** The page's size as displayed, with rotation applied. */
export const visualSize = (page: Pick<PdfPage, 'cropBox' | 'rotate'>): VisualSize => {
  const width = boxWidth(page.cropBox);
  const height = boxHeight(page.cropBox);
  return page.rotate === 90 || page.rotate === 270
    ? { width: height, height: width }
    : { width, height };
};

/** One point, displayed space → user space. */
export const visualPointToUser = (
  page: Pick<PdfPage, 'cropBox' | 'rotate'>,
  x: number,
  y: number,
): { readonly x: number; readonly y: number } => {
  const { llx, lly, urx, ury } = page.cropBox;
  const width = urx - llx;
  const height = ury - lly;
  switch (page.rotate) {
    case 90:
      return { x: llx + y, y: lly + x };
    case 180:
      return { x: llx + width - x, y: lly + y };
    case 270:
      return { x: llx + width - y, y: lly + height - x };
    default:
      return { x: llx + x, y: ury - y };
  }
};

/** One point, user space → displayed space. */
export const userPointToVisual = (
  page: Pick<PdfPage, 'cropBox' | 'rotate'>,
  x: number,
  y: number,
): { readonly x: number; readonly y: number } => {
  const { llx, lly, urx, ury } = page.cropBox;
  switch (page.rotate) {
    case 90:
      return { x: y - lly, y: x - llx };
    case 180:
      return { x: urx - x, y: y - lly };
    case 270:
      return { x: ury - y, y: urx - x };
    default:
      return { x: x - llx, y: ury - y };
  }
};

const bbox = (points: ReadonlyArray<{ x: number; y: number }>): UserRect => {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
};

/**
 * A rectangle the author drew, converted to the annotation's `/Rect`.
 *
 * All four corners are mapped and the bounding box taken, so the conversion
 * stays correct for every rotation without a per-case rectangle formula.
 */
export const visualRectToUser = (
  page: Pick<PdfPage, 'cropBox' | 'rotate'>,
  rect: VisualRect,
): UserRect =>
  bbox([
    visualPointToUser(page, rect.x, rect.y),
    visualPointToUser(page, rect.x + rect.width, rect.y),
    visualPointToUser(page, rect.x, rect.y + rect.height),
    visualPointToUser(page, rect.x + rect.width, rect.y + rect.height),
  ]);

/** The inverse, used to report auto-detected zones back to a human. */
export const userRectToVisual = (
  page: Pick<PdfPage, 'cropBox' | 'rotate'>,
  rect: UserRect,
): VisualRect => {
  const [x0, y0, x1, y1] = rect;
  const [minX, minY, maxX, maxY] = bbox([
    userPointToVisual(page, x0, y0),
    userPointToVisual(page, x1, y0),
    userPointToVisual(page, x0, y1),
    userPointToVisual(page, x1, y1),
  ]);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

/** Grow a rectangle by `padding` points on every side. */
export const padUserRect = (rect: UserRect, padding: number): UserRect => [
  rect[0] - padding,
  rect[1] - padding,
  rect[2] + padding,
  rect[3] + padding,
];

/**
 * Clamp to the page's media box.
 *
 * An annotation whose rectangle leaves the page is not a cosmetic problem:
 * some viewers drop the annotation outright, so the figure silently stops
 * being clickable.
 */
export const clampToPage = (page: Pick<PdfPage, 'mediaBox'>, rect: UserRect): UserRect => {
  const { llx, lly, urx, ury } = page.mediaBox;
  return [
    Math.min(Math.max(rect[0], llx), urx),
    Math.min(Math.max(rect[1], lly), ury),
    Math.min(Math.max(rect[2], llx), urx),
    Math.min(Math.max(rect[3], lly), ury),
  ];
};

export const rectArea = (rect: UserRect): number =>
  Math.max(0, rect[2] - rect[0]) * Math.max(0, rect[3] - rect[1]);
