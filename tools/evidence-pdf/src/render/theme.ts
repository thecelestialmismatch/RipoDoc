/** Visual constants for the evidence PDF. Kept separate so brand changes are one file. */

import type { Rgb } from '../pdf/document.ts';

export const COLORS = {
  ink: { r: 0.07, g: 0.09, b: 0.13 },
  muted: { r: 0.42, g: 0.45, b: 0.5 },
  hairline: { r: 0.85, g: 0.87, b: 0.89 },
  card: { r: 0.976, g: 0.98, b: 0.984 },
  accent: { r: 0.11, g: 0.31, b: 0.85 },
  accentSoft: { r: 0.9, g: 0.93, b: 0.99 },
  bar: { r: 0.16, g: 0.36, b: 0.78 },
  page: { r: 1, g: 1, b: 1 },
} as const satisfies Record<string, Rgb>;

export const LAYOUT = {
  margin: 48,
  headerHeight: 96,
  kpiHeight: 92,
  kpiGap: 14,
  chartHeight: 196,
  claimHeight: 58,
  blockGap: 20,
} as const;

export const TYPE = {
  title: 21,
  subtitle: 10.5,
  sectionLabel: 8.5,
  kpiValue: 26,
  kpiLabel: 9,
  caption: 8,
  body: 9.5,
  footer: 7.5,
} as const;
