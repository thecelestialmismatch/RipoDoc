export type PdfStress = { readonly label: string; readonly shortLabel: string; readonly mechanism: string; readonly sourceLabel: string; readonly sourceHref?: string };
export type PdfRun = {
  readonly label: string;
  readonly seed: number;
  readonly trendMultiplier: number;
  readonly residualMultiplier: number;
  readonly stress: PdfStress;
  readonly p10: number;
  readonly p25: number;
  readonly p50: number;
  readonly p75: number;
  readonly p90: number;
  readonly p50Series: readonly number[];
};
export type PdfStressResult = { readonly stress: PdfStress; readonly p10: number; readonly p50: number; readonly delta: number; readonly clampRate: number };
export type PdfReport = {
  readonly generatedAt: string;
  readonly series: { readonly label: string; readonly unit: string; readonly historyLabels: readonly string[]; readonly values: readonly number[]; readonly provenance: string; readonly scope: string };
  readonly shared: { readonly paths: number; readonly horizon: number; readonly comparisonEnabled: boolean };
  readonly runA: PdfRun;
  readonly runB?: PdfRun;
  readonly customProfile: { readonly name: string; readonly trendShock: number; readonly volatilityMultiplier: number; readonly description: string };
  readonly stressResults: readonly PdfStressResult[];
};

const ascii = (value: string) => value.replace(/[^\x20-\x7E]/g, '?');
const value = (number: number, unit: string) => unit === '%' ? `${number.toFixed(1)}%` : `${Math.round(number)}`;
const delta = (number: number, unit: string) => `${number >= 0 ? '+' : ''}${value(number, unit)}`;

export async function downloadScenarioComparisonPdf(report: PdfReport) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'pt', format: 'letter', compress: true });
  const width = 612;
  const height = 792;
  const margin = 42;
  const ink = [220, 235, 247] as const;
  const muted = [127, 153, 178] as const;
  const navy = [8, 19, 34] as const;
  const blue = [124, 156, 255] as const;
  const mint = [84, 227, 182] as const;
  const amber = [230, 173, 84] as const;
  let page = 1;

  const text = (content: string, x: number, y: number, size = 9, color: readonly number[] = ink, style: 'normal' | 'bold' = 'normal') => {
    pdf.setFont('helvetica', style); pdf.setFontSize(size); pdf.setTextColor(color[0]!, color[1]!, color[2]!); pdf.text(ascii(content), x, y);
  };
  const wrapped = (content: string, x: number, y: number, maxWidth: number, size = 9, color: readonly number[] = muted, leading = 12) => {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(size); const lines = pdf.splitTextToSize(ascii(content), maxWidth) as string[]; lines.forEach((line, index) => text(line, x, y + index * leading, size, color)); return y + Math.max(lines.length, 1) * leading;
  };
  const line = (x1: number, y1: number, x2: number, y2: number, color: readonly number[] = [47, 73, 99]) => { pdf.setDrawColor(color[0]!, color[1]!, color[2]!); pdf.setLineWidth(.6); pdf.line(x1, y1, x2, y2); };
  const box = (x: number, y: number, w: number, h: number, fill: readonly number[] = [12, 31, 51], stroke: readonly number[] = [48, 78, 105]) => { pdf.setFillColor(fill[0]!, fill[1]!, fill[2]!); pdf.setDrawColor(stroke[0]!, stroke[1]!, stroke[2]!); pdf.roundedRect(x, y, w, h, 4, 4, 'FD'); };
  const footer = () => { line(margin, height - 38, width - margin, height - 38); text('RIPODOC / FIXTURE-ONLY SCENARIO REPORT', margin, height - 24, 7, muted, 'bold'); text(`PAGE ${page}`, width - margin - 30, height - 24, 7, muted, 'bold'); };
  const title = (eyebrow: string, headline: string, subhead: string) => { pdf.setFillColor(navy[0], navy[1], navy[2]); pdf.rect(0, 0, width, height, 'F'); text(eyebrow, margin, 52, 8, mint, 'bold'); const lines = pdf.splitTextToSize(ascii(headline), 430) as string[]; lines.forEach((lineItem, index) => text(lineItem, margin, 92 + index * 31, 27, ink, 'bold')); wrapped(subhead, margin, 92 + lines.length * 31 + 13, 445, 10, muted, 14); line(margin, 198, width - margin, 198, [65, 97, 125]); };
  const runBlock = (run: PdfRun, x: number, y: number, w: number, accent: readonly number[]) => { box(x, y, w, 117); text(run.label.toUpperCase(), x + 12, y + 18, 8, accent, 'bold'); text(run.stress.shortLabel, x + 12, y + 36, 12, ink, 'bold'); text(`Seed ${run.seed.toLocaleString()} / trend ${run.trendMultiplier.toFixed(2)}x / residual ${run.residualMultiplier.toFixed(2)}x`, x + 12, y + 51, 7.5, muted); text(`P10 ${value(run.p10, report.series.unit)}     P50 ${value(run.p50, report.series.unit)}     P90 ${value(run.p90, report.series.unit)}`, x + 12, y + 72, 8, ink, 'bold'); wrapped(run.stress.mechanism, x + 12, y + 89, w - 24, 7.5, muted, 10); };
  const chart = (x: number, y: number, w: number, h: number) => {
    box(x, y, w, h, [7, 22, 38], [46, 74, 99]);
    text('HISTORICAL FIXTURE + P50 COMPARISON', x + 12, y + 17, 7.5, muted, 'bold');
    const values = [...report.series.values, ...report.runA.p50Series, ...(report.runB?.p50Series ?? [])];
    const minimum = report.series.unit === '%' ? Math.max(0, Math.floor(Math.min(...values) / 2) * 2) : Math.max(0, Math.floor(Math.min(...values) - 4));
    const maximum = report.series.unit === '%' ? 100 : Math.ceil(Math.max(...values) + 4);
    const plotX = x + 34; const plotY = y + 32; const plotW = w - 50; const plotH = h - 52;
    [0, .5, 1].forEach((position) => line(plotX, plotY + plotH * position, plotX + plotW, plotY + plotH * position, [34, 57, 79]));
    const point = (number: number, index: number, count: number, startIndex = 0) => [plotX + ((startIndex + index) / Math.max(count - 1, 1)) * plotW, plotY + plotH - ((number - minimum) / Math.max(maximum - minimum, 1)) * plotH] as const;
    const total = report.series.values.length + report.runA.p50Series.length;
    const draw = (items: readonly number[], color: readonly number[], startIndex: number, dashed = false) => { pdf.setDrawColor(color[0]!, color[1]!, color[2]!); pdf.setLineWidth(1.5); pdf.setLineDashPattern(dashed ? [3, 2] : [], 0); items.forEach((item, index) => { if (index) { const previous = point(items[index - 1]!, index - 1, total, startIndex); const current = point(item, index, total, startIndex); pdf.line(previous[0], previous[1], current[0], current[1]); } }); pdf.setLineDashPattern([], 0); };
    draw(report.series.values, [173, 199, 221], 0); draw(report.runA.p50Series, blue, report.series.values.length - 1, true); if (report.runB) draw(report.runB.p50Series, mint, report.series.values.length - 1, true);
    line(point(report.series.values[report.series.values.length - 1]!, report.series.values.length - 1, total)[0], plotY, point(report.series.values[report.series.values.length - 1]!, report.series.values.length - 1, total)[0], plotY + plotH, [78, 142, 155]);
    text('fixture', plotX, y + h - 13, 7, muted); text('simulation', plotX + plotW - 42, y + h - 13, 7, muted); text(`min ${report.series.unit === '%' ? `${minimum}%` : minimum}`, x + 4, plotY + plotH, 6.5, muted); text(`max ${report.series.unit === '%' ? `${maximum}%` : maximum}`, x + 4, plotY + 5, 6.5, muted);
  };

  title('RIPODOC / MULTI-SCENARIO EXPORT', 'Comparison results, controls, and fixture boundary', 'A browser-generated report of the selected public-fixture simulation. It contains no customer data, evidence delivery, account identity, API request, live market data, or stored server result.');
  text(`Generated locally: ${new Date(report.generatedAt).toLocaleString()}`, margin, 220, 8, muted); text(`Series: ${report.series.label} / ${report.shared.paths.toLocaleString()} paths / ${report.shared.horizon} future periods`, margin, 237, 9, ink, 'bold');
  runBlock(report.runA, margin, 262, report.runB ? 255 : width - margin * 2, blue); if (report.runB) runBlock(report.runB, margin + 273, 262, 255, mint);
  chart(margin, 400, width - margin * 2, 194);
  box(margin, 612, width - margin * 2, 102, [15, 37, 57], [74, 110, 137]); text('INTERPRETATION BOUNDARY', margin + 12, 631, 8, amber, 'bold'); wrapped('Historical labels and any custom profile are fixture modifiers only. This report is not a forecast, probability, customer record, market model, service commitment, investment analysis, operational recommendation, or decision instrument.', margin + 12, 649, width - margin * 2 - 24, 8.5, ink, 12); footer();

  page += 1; pdf.addPage(); title('RESULT REGISTER', 'End-horizon comparison and automated stress results', 'All values are calculated from the active browser state at export time. The report reproduces selected outputs; it does not deliver or retain evidence.');
  let y = 225; text('PAIRED COMPARISON', margin, y, 8, mint, 'bold'); y += 16;
  const headers = ['Run', 'Stress label', 'P10', 'P25', 'P50', 'P75', 'P90']; const widths = [55, 153, 54, 54, 54, 54, 54]; let x = margin;
  headers.forEach((header, index) => { box(x, y, widths[index]!, 22, [24, 51, 75], [63, 96, 124]); text(header, x + 6, y + 14, 7, muted, 'bold'); x += widths[index]!; });
  const rows = [report.runA, ...(report.runB ? [report.runB] : [])]; y += 22; rows.forEach((run) => { x = margin; const items = [run.label, run.stress.shortLabel, value(run.p10, report.series.unit), value(run.p25, report.series.unit), value(run.p50, report.series.unit), value(run.p75, report.series.unit), value(run.p90, report.series.unit)]; items.forEach((item, index) => { box(x, y, widths[index]!, 25, [8, 25, 41], [40, 67, 91]); text(item, x + 6, y + 16, 7.2, index === 0 ? ink : muted, index === 0 ? 'bold' : 'normal'); x += widths[index]!; }); y += 25; });
  y += 34; text('AUTOMATED HISTORICAL-STRESS SUITE', margin, y, 8, amber, 'bold'); y += 17;
  report.stressResults.forEach((item) => { box(margin, y, width - margin * 2, 60, [9, 28, 46], [66, 88, 109]); text(item.stress.shortLabel, margin + 12, y + 18, 8, amber, 'bold'); text(item.stress.label, margin + 112, y + 18, 9, ink, 'bold'); text(`P10 ${value(item.p10, report.series.unit)}    P50 ${value(item.p50, report.series.unit)}    delta vs Run A ${delta(item.delta, report.series.unit)}    bound rate ${(item.clampRate * 100).toFixed(1)}%`, margin + 12, y + 35, 7.5, muted); wrapped(item.stress.mechanism, margin + 12, y + 49, width - margin * 2 - 24, 7, muted, 9); y += 69; });
  footer();

  page += 1; pdf.addPage(); title('ASSUMPTIONS & TRACE', 'Custom profile, methodology, and source basis', 'The custom profile and all controls are local to the browser session. It is not saved, shared, calibrated to historical loss, or connected to RipoDoc accounts, integrations, or customer evidence.');
  y = 220; box(margin, y, width - margin * 2, 112, [13, 35, 55], [59, 92, 118]); text('CUSTOM USER-DEFINED STRESS PROFILE', margin + 12, y + 20, 8, mint, 'bold'); text(report.customProfile.name, margin + 12, y + 41, 12, ink, 'bold'); text(`Trend shock ${(report.customProfile.trendShock * 100).toFixed(0)}% / effective trend factor ${(1 + report.customProfile.trendShock).toFixed(2)}x / volatility multiplier ${report.customProfile.volatilityMultiplier.toFixed(2)}x`, margin + 12, y + 60, 8, muted); wrapped(report.customProfile.description || 'No custom profile notes entered.', margin + 12, y + 79, width - margin * 2 - 24, 8, ink, 11);
  y += 145; text('SOURCE BASIS FOR DOCUMENTED STRESS LABELS', margin, y, 8, amber, 'bold'); y += 17; report.stressResults.forEach((item) => { text(item.stress.label, margin, y, 8.5, ink, 'bold'); y = wrapped(`${item.stress.sourceLabel}${item.stress.sourceHref ? ` - ${item.stress.sourceHref}` : ''}`, margin + 12, y + 14, width - margin * 2 - 12, 7.5, muted, 10) + 9; });
  y += 8; text('MODEL LIMITS', margin, y, 8, amber, 'bold'); y += 17; wrapped('The source material provides historical context only. Fixed historical presets and manual inputs change selected fixture trend and dispersion factors; they do not import market returns, estimate likelihood, predict business results, price risk, assess a portfolio, or prescribe an operational response.', margin, y, width - margin * 2, 8.5, ink, 12); y += 77; text('FIXTURE PROVENANCE', margin, y, 8, mint, 'bold'); y += 17; text(report.series.provenance, margin, y, 9, ink, 'bold'); wrapped(report.series.scope, margin, y + 15, width - margin * 2, 8, muted, 11); footer();

  pdf.save('ripodoc-multi-scenario-comparison.pdf');
}
