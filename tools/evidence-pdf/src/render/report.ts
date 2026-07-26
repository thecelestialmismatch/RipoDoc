/**
 * Render a `ReportManifest` into a clickable evidence PDF.
 *
 * The rule this file exists to enforce: **every element drawn on the page gets
 * a link annotation covering exactly the box it was drawn in.** The renderer
 * therefore computes each element's box once and uses that same box for both
 * the drawing and the annotation — they cannot drift apart.
 */

import {
  A4_PORTRAIT,
  type Box,
  isLoopbackHttp,
  PdfDocument,
  type Page,
} from '../pdf/document.ts';
import { textWidth, truncateToWidth, wrapText } from '../pdf/metrics.ts';
import type { ReportElement, ReportManifest } from '../../../../web/frontend/src/lib/evidence/types.ts';
import { COLORS, LAYOUT, TYPE } from './theme.ts';

export interface RenderOptions {
  /**
   * Already recipient-bound evidence base URL, e.g.
   * `https://ripodoc.com/e/<token>`. The renderer never mints tokens — it has
   * no access to the signing key by design.
   */
  readonly evidenceBaseUrl: string;
  /** Fixed timestamp for reproducible output. */
  readonly createdAt: Date;
  /** 32 lowercase hex chars. */
  readonly documentId: string;
  /** Human-readable expiry, shown in the footer. */
  readonly expiresLabel: string;
  /** Local development only: permit `http` links to loopback hosts. */
  readonly allowLoopbackHttp?: boolean;
}

const contentWidth = A4_PORTRAIT.width - LAYOUT.margin * 2;

const elementUrl = (base: string, elementId: string): string => {
  const normalised = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${normalised}/${encodeURIComponent(elementId)}`;
};

/** Draw the small "click to see the data" affordance in an element's corner. */
const drawEvidenceBadge = (page: Page, box: Box): void => {
  const label = 'VIEW DATA';
  const paddingX = 5;
  const width = textWidth(label, 'Helvetica-Bold', 6.5) + paddingX * 2;
  const height = 12;
  const badge: Box = {
    x: box.x + box.width - width - 10,
    y: box.y + 10,
    width,
    height,
  };
  page.fillRect(badge, COLORS.accentSoft);
  page.text(label, {
    x: badge.x,
    y: badge.y + 8.4,
    width: badge.width,
    align: 'center',
    font: 'Helvetica-Bold',
    size: 6.5,
    color: COLORS.accent,
  });
};

const drawHeader = (page: Page, manifest: ReportManifest, options: RenderOptions): number => {
  const top = LAYOUT.margin;
  page.text(manifest.provider.toUpperCase(), {
    x: LAYOUT.margin,
    y: top + 9,
    font: 'Helvetica-Bold',
    size: TYPE.sectionLabel,
    color: COLORS.accent,
  });
  page.text(`v${manifest.version}`, {
    x: LAYOUT.margin,
    y: top + 9,
    width: contentWidth,
    align: 'right',
    font: 'Helvetica',
    size: TYPE.sectionLabel,
    color: COLORS.muted,
  });

  page.text(manifest.title, {
    x: LAYOUT.margin,
    y: top + 36,
    font: 'Helvetica-Bold',
    size: TYPE.title,
    color: COLORS.ink,
  });

  page.text(`${manifest.client}  ·  ${manifest.periodLabel}`, {
    x: LAYOUT.margin,
    y: top + 54,
    font: 'Helvetica',
    size: TYPE.subtitle,
    color: COLORS.muted,
  });

  const hintY = top + 74;
  page.fillRect(
    { x: LAYOUT.margin, y: hintY - 10, width: contentWidth, height: 20 },
    COLORS.accentSoft,
  );
  page.text(
    'Every figure below is clickable. Tap or click any card to open the exact rows behind it.',
    {
      x: LAYOUT.margin + 8,
      y: hintY + 3.5,
      font: 'Helvetica',
      size: TYPE.caption,
      color: COLORS.accent,
    },
  );

  page.strokeLine(
    { x: LAYOUT.margin, y: top + LAYOUT.headerHeight },
    { x: LAYOUT.margin + contentWidth, y: top + LAYOUT.headerHeight },
    COLORS.hairline,
  );
  void options;
  return top + LAYOUT.headerHeight + LAYOUT.blockGap;
};

const drawKpiRow = (
  page: Page,
  elements: readonly ReportElement[],
  y: number,
  options: RenderOptions,
): number => {
  if (elements.length === 0) return y;
  const count = elements.length;
  const cardWidth = (contentWidth - LAYOUT.kpiGap * (count - 1)) / count;

  elements.forEach((element, index) => {
    const box: Box = {
      x: LAYOUT.margin + index * (cardWidth + LAYOUT.kpiGap),
      y,
      width: cardWidth,
      height: LAYOUT.kpiHeight,
    };
    page.fillRect(box, COLORS.card);
    page.strokeLine(
      { x: box.x, y: box.y },
      { x: box.x + box.width, y: box.y },
      COLORS.accent,
      2,
    );

    const value = truncateToWidth(element.value ?? '', 'Helvetica-Bold', TYPE.kpiValue, box.width - 24);
    page.text(value, {
      x: box.x + 12,
      y: box.y + 44,
      font: 'Helvetica-Bold',
      size: TYPE.kpiValue,
      color: COLORS.ink,
    });
    page.text(truncateToWidth(element.label, 'Helvetica', TYPE.kpiLabel, box.width - 24), {
      x: box.x + 12,
      y: box.y + 62,
      font: 'Helvetica',
      size: TYPE.kpiLabel,
      color: COLORS.muted,
    });
    if (element.caption) {
      page.text(truncateToWidth(element.caption, 'Helvetica', TYPE.caption, box.width - 24), {
        x: box.x + 12,
        y: box.y + 76,
        font: 'Helvetica',
        size: TYPE.caption,
        color: COLORS.muted,
      });
    }

    drawEvidenceBadge(page, box);
    page.link(box, elementUrl(options.evidenceBaseUrl, element.id), {
      allowLoopbackHttp: options.allowLoopbackHttp === true,
    });
  });

  return y + LAYOUT.kpiHeight + LAYOUT.blockGap;
};

const drawBarChart = (
  page: Page,
  element: ReportElement,
  y: number,
  options: RenderOptions,
): number => {
  const box: Box = { x: LAYOUT.margin, y, width: contentWidth, height: LAYOUT.chartHeight };
  page.fillRect(box, COLORS.card);

  page.text(element.label, {
    x: box.x + 14,
    y: box.y + 22,
    font: 'Helvetica-Bold',
    size: 12,
    color: COLORS.ink,
  });
  if (element.caption) {
    page.text(truncateToWidth(element.caption, 'Helvetica', TYPE.caption, box.width - 120), {
      x: box.x + 14,
      y: box.y + 36,
      font: 'Helvetica',
      size: TYPE.caption,
      color: COLORS.muted,
    });
  }

  const series = element.series ?? [];
  const plot = {
    x: box.x + 14,
    y: box.y + 50,
    width: box.width - 28,
    height: box.height - 50 - 34,
  };
  const maxValue = Math.max(...series.map((datum) => datum.value), 1);
  const slot = plot.width / series.length;
  const barWidth = Math.min(slot * 0.58, 54);

  page.strokeLine(
    { x: plot.x, y: plot.y + plot.height },
    { x: plot.x + plot.width, y: plot.y + plot.height },
    COLORS.hairline,
  );

  series.forEach((datum, index) => {
    const height = Math.max((datum.value / maxValue) * (plot.height - 16), 2);
    const barX = plot.x + index * slot + (slot - barWidth) / 2;
    page.fillRect(
      { x: barX, y: plot.y + plot.height - height, width: barWidth, height },
      COLORS.bar,
    );
    page.text(datum.value.toLocaleString('en-US'), {
      x: barX,
      y: plot.y + plot.height - height - 5,
      width: barWidth,
      align: 'center',
      font: 'Helvetica-Bold',
      size: 7.5,
      color: COLORS.ink,
    });
    page.text(truncateToWidth(datum.label, 'Helvetica', 7.5, slot - 4), {
      x: barX - (slot - barWidth) / 2,
      y: plot.y + plot.height + 12,
      width: slot,
      align: 'center',
      font: 'Helvetica',
      size: 7.5,
      color: COLORS.muted,
    });
  });

  drawEvidenceBadge(page, box);
  page.link(box, elementUrl(options.evidenceBaseUrl, element.id), {
    allowLoopbackHttp: options.allowLoopbackHttp === true,
  });
  return y + LAYOUT.chartHeight + LAYOUT.blockGap;
};

const drawClaim = (
  page: Page,
  element: ReportElement,
  y: number,
  options: RenderOptions,
): number => {
  const box: Box = { x: LAYOUT.margin, y, width: contentWidth, height: LAYOUT.claimHeight };
  page.fillRect(box, COLORS.card);
  page.strokeLine({ x: box.x, y: box.y }, { x: box.x, y: box.y + box.height }, COLORS.accent, 2);

  page.text(element.label, {
    x: box.x + 14,
    y: box.y + 20,
    font: 'Helvetica-Bold',
    size: 10,
    color: COLORS.ink,
  });

  const lines = wrapText(element.caption ?? '', 'Helvetica', TYPE.body, box.width - 110, 2);
  lines.forEach((line, index) => {
    page.text(line, {
      x: box.x + 14,
      y: box.y + 35 + index * 12,
      font: 'Helvetica',
      size: TYPE.body,
      color: COLORS.muted,
    });
  });

  drawEvidenceBadge(page, box);
  page.link(box, elementUrl(options.evidenceBaseUrl, element.id), {
    allowLoopbackHttp: options.allowLoopbackHttp === true,
  });
  return y + LAYOUT.claimHeight + LAYOUT.kpiGap;
};

const drawFooter = (page: Page, manifest: ReportManifest, options: RenderOptions): void => {
  const y = A4_PORTRAIT.height - LAYOUT.margin;
  page.strokeLine(
    { x: LAYOUT.margin, y: y - 26 },
    { x: LAYOUT.margin + contentWidth, y: y - 26 },
    COLORS.hairline,
  );
  page.text(
    `Prepared for ${manifest.recipient.name} <${manifest.recipient.email}> — links are bound to this recipient and expire ${options.expiresLabel}.`,
    {
      x: LAYOUT.margin,
      y: y - 14,
      font: 'Helvetica',
      size: TYPE.footer,
      color: COLORS.muted,
    },
  );
  page.text(
    `${manifest.reportId} v${manifest.version} · published ${manifest.publishedAt} · every access is logged`,
    { x: LAYOUT.margin, y: y - 4, font: 'Helvetica', size: TYPE.footer, color: COLORS.muted },
  );
};

/** Render the manifest. Returns the document so callers can assert on it. */
export const renderReport = (
  manifest: ReportManifest,
  options: RenderOptions,
): PdfDocument => {
  const parsed = new URL(options.evidenceBaseUrl);
  if (parsed.protocol !== 'https:' && !isLoopbackHttp(parsed, options.allowLoopbackHttp)) {
    throw new Error('evidenceBaseUrl must be https (loopback http requires allowLoopbackHttp)');
  }

  const doc = new PdfDocument({
    title: `${manifest.title} — ${manifest.client}`,
    author: manifest.provider,
    subject: `RipoDoc evidence report ${manifest.reportId} v${manifest.version}`,
    createdAt: options.createdAt,
    documentId: options.documentId,
  });

  const page = doc.addPage();
  page.fillRect({ x: 0, y: 0, width: A4_PORTRAIT.width, height: A4_PORTRAIT.height }, COLORS.page);

  let cursor = drawHeader(page, manifest, options);
  cursor = drawKpiRow(
    page,
    manifest.elements.filter((element) => element.kind === 'kpi'),
    cursor,
    options,
  );

  for (const element of manifest.elements.filter((item) => item.kind === 'bar-chart')) {
    cursor = drawBarChart(page, element, cursor, options);
  }

  const claims = manifest.elements.filter((element) => element.kind === 'claim');
  if (claims.length > 0) {
    page.text('SUPPORTED CLAIMS', {
      x: LAYOUT.margin,
      y: cursor + 8,
      font: 'Helvetica-Bold',
      size: TYPE.sectionLabel,
      color: COLORS.muted,
    });
    cursor += 20;
    for (const element of claims) {
      cursor = drawClaim(page, element, cursor, options);
    }
  }

  drawFooter(page, manifest, options);

  if (doc.linkCount !== manifest.elements.length) {
    throw new Error(
      `Every element must be clickable: ${manifest.elements.length} elements produced ${doc.linkCount} links`,
    );
  }
  return doc;
};
