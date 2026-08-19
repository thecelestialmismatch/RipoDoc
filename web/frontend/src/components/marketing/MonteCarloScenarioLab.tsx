'use client';

import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, ArrowLeftRight, BarChart3, BookOpen, ChevronDown, Download, FlaskConical, Info, Layers3, RefreshCcw, Sigma, SlidersHorizontal, Sparkles } from 'lucide-react';

type SeriesId = 'resolution-volume' | 'service-continuity';
type StressPresetId = 'baseline' | 'black-monday-1987' | 'global-financial-crisis' | 'covid-market-shock';
type Series = {
  readonly id: SeriesId;
  readonly label: string;
  readonly shortLabel: string;
  readonly unit: string;
  readonly historicalLabels: readonly string[];
  readonly values: readonly number[];
  readonly color: string;
  readonly lower: number;
  readonly upper?: number;
  readonly provenance: string;
  readonly scope: string;
};
type StressPreset = {
  readonly id: StressPresetId;
  readonly label: string;
  readonly shortLabel: string;
  readonly historicalContext: string;
  readonly mechanism: string;
  readonly trendFactor: number;
  readonly residualFactor: number;
  readonly sourceLabel: string;
  readonly sourceHref?: string;
};
type ScenarioConfig = { readonly seed: number; readonly trendMultiplier: number; readonly residualMultiplier: number; readonly stressPreset: StressPresetId };
type Percentiles = { readonly p10: readonly number[]; readonly p25: readonly number[]; readonly p50: readonly number[]; readonly p75: readonly number[]; readonly p90: readonly number[] };
type Simulation = {
  readonly fittedSlope: number;
  readonly effectiveSlope: number;
  readonly residualSD: number;
  readonly effectiveResidualSD: number;
  readonly percentiles: Percentiles;
  readonly finalSensitivity: readonly { readonly multiplier: number; readonly value: number }[];
  readonly clampRate: number;
  readonly futureLabels: readonly string[];
  readonly stress: StressPreset;
};

const SERIES: Record<SeriesId, Series> = {
  'resolution-volume': {
    id: 'resolution-volume', label: 'Resolution volume', shortLabel: 'Fixture tickets closed', unit: 'tickets',
    historicalLabels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'], values: [24, 31, 27, 38, 44, 42, 51, 58], color: '#7c9cff', lower: 0,
    provenance: 'Approved fixture service-event ledger', scope: 'Eight fixture reporting weeks / resolved records only',
  },
  'service-continuity': {
    id: 'service-continuity', label: 'Service continuity', shortLabel: 'Fixture recovery confidence', unit: '%',
    historicalLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'], values: [89.6, 91.1, 90.4, 93.2, 94.8, 94.1, 96.7, 97.8], color: '#54e3b6', lower: 0, upper: 100,
    provenance: 'Reviewed fixture recovery-verification register', scope: 'Eight fixture review points / continuity criterion only',
  },
};

const STRESS_PRESETS: Record<StressPresetId, StressPreset> = {
  baseline: { id: 'baseline', label: 'Baseline fixture assumptions', shortLabel: 'BASELINE', historicalContext: 'No historical-market modifier is applied. The run uses only the selected fixture trend and in-sample dispersion.', mechanism: 'Trend factor 1.00× · residual factor 1.00×', trendFactor: 1, residualFactor: 1, sourceLabel: 'RipoDoc fixture-model baseline' },
  'black-monday-1987': { id: 'black-monday-1987', label: 'Black Monday · 19 Oct 1987', shortLabel: '1987 ACUTE', historicalContext: 'The Federal Reserve’s historical account describes the S&P 500 falling about 20% on 19 October 1987. This preset uses that period only as an acute speed-and-liquidity stress label.', mechanism: 'Trend factor 0.85× · residual factor 1.60×', trendFactor: 0.85, residualFactor: 1.6, sourceLabel: 'Federal Reserve Board, 1987 crash history', sourceHref: 'https://www.federalreserve.gov/pubs/feds/2007/200713/' },
  'global-financial-crisis': { id: 'global-financial-crisis', label: 'Global financial crisis · 2007–09', shortLabel: 'GFC PROLONGED', historicalContext: 'Federal Reserve History states that the S&P 500 fell 57% from its October 2007 peak to its March 2009 trough. This preset represents a prolonged adverse-regime label.', mechanism: 'Trend factor 0.60× · residual factor 2.00×', trendFactor: 0.6, residualFactor: 2, sourceLabel: 'Federal Reserve History, Great Recession', sourceHref: 'https://www.federalreservehistory.org/essays/great-recession-of-200709' },
  'covid-market-shock': { id: 'covid-market-shock', label: 'COVID market shock · Feb–Mar 2020', shortLabel: 'COVID RAPID', historicalContext: 'The Federal Reserve’s May 2020 Financial Stability Report describes large asset-price declines, increased volatility, and funding-market strain during February and March 2020. This preset represents rapid repricing-and-liquidity stress.', mechanism: 'Trend factor 0.75× · residual factor 1.80×', trendFactor: 0.75, residualFactor: 1.8, sourceLabel: 'Federal Reserve, Financial Stability Report – May 2020', sourceHref: 'https://www.federalreserve.gov/publications/2020-may-financial-stability-report-overview.htm' },
};

const PATH_OPTIONS = [1000, 2500, 5000, 10000] as const;
const STRESS_CASES = ['black-monday-1987', 'global-financial-crisis', 'covid-market-shock'] as const;
const DEFAULT_A: ScenarioConfig = { seed: 20260819, trendMultiplier: 1, residualMultiplier: 1, stressPreset: 'baseline' };
const DEFAULT_B: ScenarioConfig = { seed: 20260911, trendMultiplier: 0.9, residualMultiplier: 1.25, stressPreset: 'black-monday-1987' };
const clamp = (value: number, min: number, max?: number) => Math.min(Math.max(value, min), max ?? Number.POSITIVE_INFINITY);
const round = (value: number, digits = 1) => Number(value.toFixed(digits));
const formatValue = (value: number, unit: string) => unit === '%' ? `${value.toFixed(1)}%` : `${Math.round(value)}`;
const signed = (value: number, unit: string) => `${value >= 0 ? '+' : ''}${formatValue(value, unit)}`;

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(random: () => number) {
  const first = Math.max(random(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * random());
}

function linearFit(values: readonly number[]) {
  const count = values.length;
  const xs = values.map((_, index) => index + 1);
  const meanX = xs.reduce((sum, value) => sum + value, 0) / count;
  const meanY = values.reduce((sum, value) => sum + value, 0) / count;
  const denominator = xs.reduce((sum, value) => sum + (value - meanX) ** 2, 0);
  const slope = xs.reduce((sum, value, index) => sum + (value - meanX) * (values[index]! - meanY), 0) / denominator;
  const intercept = meanY - slope * meanX;
  const residualSD = Math.sqrt(values.reduce((sum, value, index) => sum + (value - (intercept + slope * xs[index]!)) ** 2, 0) / Math.max(count - 2, 1));
  return { slope, intercept, residualSD, slopeSE: residualSD / Math.sqrt(denominator) };
}

function percentile(sorted: readonly number[], fraction: number) {
  if (!sorted.length) return 0;
  const index = (sorted.length - 1) * fraction;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return lower === upper ? sorted[lower]! : sorted[lower]! + (sorted[upper]! - sorted[lower]!) * (index - lower);
}

function createFutureLabels(series: Series, horizon: number) {
  if (series.id === 'resolution-volume') return Array.from({ length: horizon }, (_, index) => `W${series.values.length + index + 1}`);
  return ['Sep', 'Oct', 'Nov', 'Dec', 'Jan+', 'Feb+', 'Mar+', 'Apr+'].slice(0, horizon);
}

function simulate(series: Series, paths: number, horizon: number, config: ScenarioConfig): Simulation {
  const fit = linearFit(series.values);
  const stress = STRESS_PRESETS[config.stressPreset];
  const random = mulberry32(config.seed + (series.id === 'service-continuity' ? 811 : 0));
  const effectiveSlope = fit.slope * config.trendMultiplier * stress.trendFactor;
  const effectiveResidualSD = fit.residualSD * config.residualMultiplier * stress.residualFactor;
  const samples = Array.from({ length: horizon }, () => [] as number[]);
  let clampCount = 0;
  for (let path = 0; path < paths; path += 1) {
    const sampledSlope = effectiveSlope + normal(random) * fit.slopeSE;
    for (let period = 0; period < horizon; period += 1) {
      const raw = fit.intercept + sampledSlope * (series.values.length + period + 1) + normal(random) * effectiveResidualSD;
      const bounded = clamp(raw, series.lower, series.upper);
      if (bounded !== raw) clampCount += 1;
      samples[period]!.push(bounded);
    }
  }
  samples.forEach((items) => items.sort((first, second) => first - second));
  const finalX = series.values.length + horizon;
  return {
    fittedSlope: fit.slope,
    effectiveSlope,
    residualSD: fit.residualSD,
    effectiveResidualSD,
    percentiles: { p10: samples.map((items) => percentile(items, .1)), p25: samples.map((items) => percentile(items, .25)), p50: samples.map((items) => percentile(items, .5)), p75: samples.map((items) => percentile(items, .75)), p90: samples.map((items) => percentile(items, .9)) },
    finalSensitivity: [.75, 1, 1.25].map((multiplier) => ({ multiplier, value: clamp(fit.intercept + effectiveSlope * multiplier * finalX, series.lower, series.upper) })),
    clampRate: clampCount / Math.max(paths * horizon, 1),
    futureLabels: createFutureLabels(series, horizon),
    stress,
  };
}

function toPoints(values: readonly number[], min: number, max: number, start: number, step: number) {
  return values.map((value, index) => `${start + index * step},${82 - ((value - min) / Math.max(max - min, 1)) * 60}`).join(' ');
}

function toArea(top: readonly number[], bottom: readonly number[], min: number, max: number, start: number, step: number) {
  const upper = toPoints(top, min, max, start, step);
  const lower = [...bottom].reverse().map((value, reverseIndex) => `${start + (bottom.length - 1 - reverseIndex) * step},${82 - ((value - min) / Math.max(max - min, 1)) * 60}`).join(' ');
  return `${upper} ${lower}`;
}

function RangeControl({ id, label, value, min, max, step, suffix, onChange }: { readonly id: string; readonly label: string; readonly value: number; readonly min: number; readonly max: number; readonly step: number; readonly suffix: string; readonly onChange: (value: number) => void }) {
  return <label className="scenario-control" htmlFor={id}><span><b>{label}</b><output>{suffix === '×' ? `${value.toFixed(2)}×` : `${value}${suffix}`}</output></span><input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /><small>{min}{suffix} <i aria-hidden="true" /> {max}{suffix}</small></label>;
}

function SharedControls({ seriesId, paths, horizon, onSeries, onPaths, onHorizon }: { readonly seriesId: SeriesId; readonly paths: (typeof PATH_OPTIONS)[number]; readonly horizon: number; readonly onSeries: (value: SeriesId) => void; readonly onPaths: (value: (typeof PATH_OPTIONS)[number]) => void; readonly onHorizon: (value: number) => void }) {
  return <section className="scenario-shared-controls" aria-label="Shared model inputs"><div><Layers3 className="h-4 w-4" aria-hidden="true" /><span>SHARED FIXTURE INPUTS</span></div><label className="scenario-select" htmlFor="scenario-series"><span><b>Fixture series</b><small>Both runs use this independent public demo series</small></span><select id="scenario-series" value={seriesId} onChange={(event) => onSeries(event.target.value as SeriesId)}><option value="resolution-volume">Resolution volume</option><option value="service-continuity">Service continuity</option></select><ChevronDown className="h-4 w-4" aria-hidden="true" /></label><label className="scenario-select" htmlFor="scenario-paths"><span><b>Simulation paths</b><small>More paths smooth percentile summaries</small></span><select id="scenario-paths" value={paths} onChange={(event) => onPaths(Number(event.target.value) as (typeof PATH_OPTIONS)[number])}>{PATH_OPTIONS.map((option) => <option key={option} value={option}>{option.toLocaleString()} paths</option>)}</select><ChevronDown className="h-4 w-4" aria-hidden="true" /></label><RangeControl id="scenario-horizon" label="Shared horizon" value={horizon} min={2} max={8} step={1} suffix=" periods" onChange={onHorizon} /></section>;
}

function RunControls({ id, title, color, config, onChange }: { readonly id: 'a' | 'b'; readonly title: string; readonly color: string; readonly config: ScenarioConfig; readonly onChange: (patch: Partial<ScenarioConfig>) => void }) {
  return <section className={`scenario-run-controls scenario-run-${id}`} aria-label={`${title} controls`}><header><span style={{ backgroundColor: color }} /><div><b>{title}</b><small>Independent assumptions</small></div></header><label className="scenario-seed" htmlFor={`scenario-${id}-seed`}><span><b>Deterministic seed</b><small>Same parameters and seed reproduce this run</small></span><input id={`scenario-${id}-seed`} type="number" value={config.seed} min={1} max={99999999} onChange={(event) => onChange({ seed: Math.max(1, Number(event.target.value) || 1) })} /></label><RangeControl id={`scenario-${id}-trend`} label="Trend multiplier" value={config.trendMultiplier} min={.5} max={1.5} step={.05} suffix="×" onChange={(value) => onChange({ trendMultiplier: value })} /><RangeControl id={`scenario-${id}-residual`} label="Residual amplitude" value={config.residualMultiplier} min={.25} max={2} step={.05} suffix="×" onChange={(value) => onChange({ residualMultiplier: value })} /><label className="scenario-select" htmlFor={`scenario-${id}-stress`}><span><b>Historical stress label</b><small>Applies documented fixture modifiers, never market returns</small></span><select id={`scenario-${id}-stress`} value={config.stressPreset} onChange={(event) => onChange({ stressPreset: event.target.value as StressPresetId })}>{Object.values(STRESS_PRESETS).map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}</select><ChevronDown className="h-4 w-4" aria-hidden="true" /></label></section>;
}

function EnvelopeChart({ series, simulation, runLabel, accent, compact = false }: { readonly series: Series; readonly simulation: Simulation; readonly runLabel: string; readonly accent: string; readonly compact?: boolean }) {
  const allValues = [...series.values, ...simulation.percentiles.p10, ...simulation.percentiles.p90];
  const min = series.upper === 100 ? Math.max(0, Math.floor(Math.min(...allValues) / 2) * 2) : Math.max(0, Math.floor(Math.min(...allValues) - 6));
  const max = series.upper === 100 ? 100 : Math.ceil(Math.max(...allValues) + 6);
  const count = series.values.length + simulation.futureLabels.length;
  const step = 210 / Math.max(count - 1, 1);
  const forecastStart = series.values.length * step;
  const label = `${runLabel}: ${series.label} public-fixture scenario envelope with historical values, P10 to P90 output, and selected historical stress assumptions`;
  return <article className={`scenario-chart ${compact ? 'is-compact' : ''}`} aria-live="polite"><div className="scenario-chart-top"><div><span>{runLabel.toUpperCase()} / PERCENTILE ENVELOPE</span><b>{simulation.stress.shortLabel}</b></div><small>{simulation.stress.mechanism}</small></div><svg viewBox="0 0 220 112" preserveAspectRatio="none" role="img" aria-label={label}><title>{label}</title><rect x={forecastStart - step / 2} y="0" width={220 - forecastStart + step / 2} height="90" fill={`${accent}18`} /><line x1="0" x2="220" y1="22" y2="22" /><line x1="0" x2="220" y1="52" y2="52" /><line x1="0" x2="220" y1="82" y2="82" /><line x1={forecastStart - step / 2} x2={forecastStart - step / 2} y1="0" y2="90" className="scenario-divider" /><polygon points={toArea(simulation.percentiles.p90, simulation.percentiles.p10, min, max, forecastStart, step)} fill={`${accent}24`} /><polygon points={toArea(simulation.percentiles.p75, simulation.percentiles.p25, min, max, forecastStart, step)} fill={`${accent}55`} /><polyline points={toPoints(series.values, min, max, 0, step)} className="scenario-history" style={{ stroke: series.color }} /><polyline points={toPoints(simulation.percentiles.p50, min, max, forecastStart, step)} fill="none" stroke={accent} strokeWidth="2.3" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />{series.values.map((value, index) => <circle key={`${runLabel}-${index}`} cx={index * step} cy={82 - ((value - min) / Math.max(max - min, 1)) * 60} r="2.6" fill={series.color} />)}<text x={forecastStart + 2} y="10" className="scenario-chart-annotation">SIMULATED</text>{[min, (min + max) / 2, max].map((value, index) => <text key={`${runLabel}-tick-${index}`} x="-1" y={85 - index * 30} className="scenario-axis-label">{series.unit === '%' ? `${Math.round(value)}%` : Math.round(value)}</text>)}</svg><div className="scenario-x-labels" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>{[...series.historicalLabels, ...simulation.futureLabels].map((labelItem, index) => <span key={`${runLabel}-${labelItem}`} className={index >= series.values.length ? 'is-future' : ''}>{labelItem}</span>)}</div><p className="scenario-chart-context">{simulation.stress.historicalContext}</p></article>;
}

function OverlayChart({ series, first, second }: { readonly series: Series; readonly first: Simulation; readonly second: Simulation }) {
  const allValues = [...series.values, ...first.percentiles.p10, ...first.percentiles.p90, ...second.percentiles.p10, ...second.percentiles.p90];
  const min = series.upper === 100 ? Math.max(0, Math.floor(Math.min(...allValues) / 2) * 2) : Math.max(0, Math.floor(Math.min(...allValues) - 6));
  const max = series.upper === 100 ? 100 : Math.ceil(Math.max(...allValues) + 6);
  const count = series.values.length + first.futureLabels.length;
  const step = 210 / Math.max(count - 1, 1);
  const forecastStart = series.values.length * step;
  return <article className="scenario-overlay-chart"><div className="scenario-chart-top"><div><span>RUN A ↔ RUN B OVERLAY</span><b>Compare two parameterized fixture paths</b></div><small>Shared series · paths · horizon</small></div><svg viewBox="0 0 220 112" preserveAspectRatio="none" role="img" aria-label={`Overlay of scenario A and scenario B ${series.label} fixture-path medians and P25 to P75 bands`}><title>Scenario A and Scenario B overlay</title><rect x={forecastStart - step / 2} y="0" width={220 - forecastStart + step / 2} height="90" fill="rgba(84, 227, 182, .06)" /><line x1="0" x2="220" y1="22" y2="22" /><line x1="0" x2="220" y1="52" y2="52" /><line x1="0" x2="220" y1="82" y2="82" /><line x1={forecastStart - step / 2} x2={forecastStart - step / 2} y1="0" y2="90" className="scenario-divider" /><polygon points={toArea(first.percentiles.p75, first.percentiles.p25, min, max, forecastStart, step)} fill="rgba(124, 156, 255, .30)" /><polygon points={toArea(second.percentiles.p75, second.percentiles.p25, min, max, forecastStart, step)} fill="rgba(84, 227, 182, .28)" /><polyline points={toPoints(series.values, min, max, 0, step)} className="scenario-history" style={{ stroke: series.color }} /><polyline points={toPoints(first.percentiles.p50, min, max, forecastStart, step)} fill="none" stroke="#7c9cff" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /><polyline points={toPoints(second.percentiles.p50, min, max, forecastStart, step)} fill="none" stroke="#54e3b6" strokeWidth="2.5" strokeDasharray="5 3" vectorEffect="non-scaling-stroke" />{series.values.map((value, index) => <circle key={`overlay-${index}`} cx={index * step} cy={82 - ((value - min) / Math.max(max - min, 1)) * 60} r="2.6" fill={series.color} />)}<text x={forecastStart + 2} y="10" className="scenario-chart-annotation">OVERLAY</text></svg><div className="scenario-legend"><span><i style={{ background:'#7c9cff' }} />Run A P50 + P25–P75</span><span><i style={{ background:'#54e3b6' }} />Run B P50 + P25–P75</span><span><i className="scenario-legend-history" style={{ backgroundColor: series.color }} />Fixture history</span></div></article>;
}

function SensitivityChart({ series, simulation }: { readonly series: Series; readonly simulation: Simulation }) {
  const max = series.upper ?? Math.max(...simulation.finalSensitivity.map((item) => item.value)) * 1.18;
  const reachedUpperBound = series.upper !== undefined && simulation.finalSensitivity.slice(1).some((item) => item.value >= series.upper!);
  return <article className="scenario-sensitivity"><div className="scenario-chart-top"><div><span>END-HORIZON SENSITIVITY</span><b>Run A slope stress test</b></div><small>Intercept held constant</small></div><div className="scenario-sensitivity-bars" role="img" aria-label={`${series.label} end-horizon sensitivity under low, baseline, and high fitted trend slope assumptions`}>{simulation.finalSensitivity.map((item) => <div key={item.multiplier}><span><i style={{ height: `${Math.max((item.value / max) * 100, 4)}%`, backgroundColor: item.multiplier === 1 ? '#7c9cff' : item.multiplier < 1 ? '#71859b' : '#d38b1c' }} /><b>{formatValue(item.value, series.unit)}</b></span><em>{item.multiplier.toFixed(2)}×</em></div>)}</div><p>{reachedUpperBound ? 'The base and high slope cases hit the valid 100% scale ceiling. This is a cap effect, not a claim of certainty.' : 'This changes the selected fixture slope only. It is not an outcome range or decision recommendation.'}</p></article>;
}

function StressSuite({ series, baseline, cases }: { readonly series: Series; readonly baseline: Simulation; readonly cases: readonly Simulation[] }) {
  const finalIndex = baseline.futureLabels.length - 1;
  const baselineP50 = baseline.percentiles.p50[finalIndex]!;
  return <section className="scenario-stress-suite"><header><div><FlaskConical className="h-5 w-5" aria-hidden="true" /><div><span>AUTOMATED HISTORICAL-STRESS SUITE</span><h2>Run the current fixture model through three documented adverse-regime presets.</h2></div></div><p>Every result is recalculated in the browser with the current shared horizon, path count, Run A seed, and Run A user controls.</p></header><div className="scenario-stress-grid">{cases.map((simulation) => { const p50 = simulation.percentiles.p50[finalIndex]!; return <article key={simulation.stress.id}><div><span>{simulation.stress.shortLabel}</span><b>{simulation.stress.label}</b></div><p>{simulation.stress.historicalContext}</p><dl><div><dt>Final P10</dt><dd>{formatValue(simulation.percentiles.p10[finalIndex]!, series.unit)}</dd></div><div><dt>Final P50</dt><dd>{formatValue(p50, series.unit)}</dd></div><div><dt>vs Run A</dt><dd>{signed(p50 - baselineP50, series.unit)}</dd></div><div><dt>Bound rate</dt><dd>{(simulation.clampRate * 100).toFixed(1)}%</dd></div></dl><small>{simulation.stress.mechanism}</small>{simulation.stress.sourceHref ? <a href={simulation.stress.sourceHref} target="_blank" rel="noreferrer"><BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> {simulation.stress.sourceLabel}</a> : null}</article>; })}</div><aside><AlertTriangle className="h-4 w-4" aria-hidden="true" /><p><b>How to read this:</b> a historical event name applies only the fixed fixture modifiers shown in each card. The suite does not import market prices, map market losses into RipoDoc outcomes, estimate event probabilities, or provide investment or operational advice.</p></aside></section>;
}

function ComparisonSummary({ series, first, second }: { readonly series: Series; readonly first: Simulation; readonly second: Simulation }) {
  const finalIndex = first.futureLabels.length - 1;
  const firstP50 = first.percentiles.p50[finalIndex]!;
  const secondP50 = second.percentiles.p50[finalIndex]!;
  return <section className="scenario-comparison-summary"><div><span>PAIRED END-HORIZON COMPARISON</span><b>{first.futureLabels[finalIndex]} / shared fixture window</b></div><table><thead><tr><th>Run</th><th>Stress label</th><th>P10</th><th>P50</th><th>P90</th><th>Δ vs A</th></tr></thead><tbody><tr><th><i className="scenario-run-dot run-a" />Run A</th><td>{first.stress.shortLabel}</td><td>{formatValue(first.percentiles.p10[finalIndex]!, series.unit)}</td><td>{formatValue(firstP50, series.unit)}</td><td>{formatValue(first.percentiles.p90[finalIndex]!, series.unit)}</td><td>—</td></tr><tr><th><i className="scenario-run-dot run-b" />Run B</th><td>{second.stress.shortLabel}</td><td>{formatValue(second.percentiles.p10[finalIndex]!, series.unit)}</td><td>{formatValue(secondP50, series.unit)}</td><td>{formatValue(second.percentiles.p90[finalIndex]!, series.unit)}</td><td>{signed(secondP50 - firstP50, series.unit)}</td></tr></tbody></table></section>;
}

export function MonteCarloScenarioLab() {
  const [seriesId, setSeriesId] = useState<SeriesId>('resolution-volume');
  const [paths, setPaths] = useState<(typeof PATH_OPTIONS)[number]>(5000);
  const [horizon, setHorizon] = useState(4);
  const [comparisonEnabled, setComparisonEnabled] = useState(true);
  const [runA, setRunA] = useState<ScenarioConfig>(DEFAULT_A);
  const [runB, setRunB] = useState<ScenarioConfig>(DEFAULT_B);
  const series = SERIES[seriesId];
  const simulationA = useMemo(() => simulate(series, paths, horizon, runA), [series, paths, horizon, runA]);
  const simulationB = useMemo(() => simulate(series, paths, horizon, runB), [series, paths, horizon, runB]);
  const stressRuns = useMemo(() => STRESS_CASES.map((id) => simulate(series, paths, horizon, { ...runA, stressPreset: id })), [series, paths, horizon, runA]);
  const finalIndex = horizon - 1;
  const finalA = simulationA.percentiles.p50[finalIndex]!;
  const reset = () => { setSeriesId('resolution-volume'); setPaths(5000); setHorizon(4); setComparisonEnabled(true); setRunA(DEFAULT_A); setRunB(DEFAULT_B); };
  const exportScenario = () => {
    const toExport = (config: ScenarioConfig, simulation: Simulation) => ({ config, stress: { label: simulation.stress.label, mechanism: simulation.stress.mechanism, historicalContext: simulation.stress.historicalContext, source: simulation.stress.sourceHref ?? 'RipoDoc fixture-model baseline' }, p10: simulation.percentiles.p10.map((value) => round(value, 4)), p25: simulation.percentiles.p25.map((value) => round(value, 4)), p50: simulation.percentiles.p50.map((value) => round(value, 4)), p75: simulation.percentiles.p75.map((value) => round(value, 4)), p90: simulation.percentiles.p90.map((value) => round(value, 4)), boundActivationRate: simulation.clampRate });
    const payload = { product: 'RipoDoc Monte Carlo Scenario Lab', fixtureOnly: true, generatedAt: new Date().toISOString(), sharedInputs: { series: series.label, paths, horizon }, comparisonEnabled, runA: toExport(runA, simulationA), runB: comparisonEnabled ? toExport(runB, simulationB) : null, automatedStressSuite: stressRuns.map((simulation) => toExport({ ...runA, stressPreset: simulation.stress.id }, simulation)), methodology: 'Seeded browser-side fixture simulations. Historical market labels apply fixed trend and residual modifiers only; this is not a market model, forecast, probability, service commitment, or decision tool.' };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'ripodoc-fixture-scenario-comparison.json'; anchor.click(); URL.revokeObjectURL(url);
  };
  const updateRun = (run: 'a' | 'b', patch: Partial<ScenarioConfig>) => { if (run === 'a') setRunA((current) => ({ ...current, ...patch })); else setRunB((current) => ({ ...current, ...patch })); };
  return <main className="scenario-lab scenario-lab-comparison"><section className="scenario-lab-hero"><div><p className="dense-kicker">MULTI-SCENARIO MONTE CARLO LAB</p><h1>Overlay the assumptions. Stress the fixture model. Compare the shape of uncertainty.</h1><p>Compare two browser-side fixture runs under independent assumptions, then automatically rerun the active model through documented historical market-stress labels. Every output remains deterministic, inspectable, and bounded to public demonstration data.</p><div className="scenario-hero-pills"><span><Sparkles className="h-4 w-4" aria-hidden="true" /> paired scenario overlay</span><span><Activity className="h-4 w-4" aria-hidden="true" /> live percentile bands</span><span><FlaskConical className="h-4 w-4" aria-hidden="true" /> historical stress suite</span></div></div><aside><span>ACTIVE COMPARISON</span><b>{series.label.toUpperCase()}</b><p>{paths.toLocaleString()} paths · shared {horizon}-period horizon · {comparisonEnabled ? 'Run A and Run B' : 'Run A only'}</p><i aria-hidden="true" /></aside></section><section className="scenario-boundary" aria-label="Scenario lab interpretation boundary"><AlertTriangle className="h-5 w-5" aria-hidden="true" /><p><b>Interpretation boundary:</b> this tool visualizes public product fixtures under selected assumptions. Historical market names are documentation-backed stress labels, not imported market data, predictions, customer evidence, probabilities of performance, service commitments, investment guidance, or decision recommendations.</p></section><section className="scenario-workbench scenario-workbench-comparison"><aside className="scenario-controls"><div className="scenario-controls-head"><div><SlidersHorizontal className="h-5 w-5" aria-hidden="true" /><span>COMPARISON CONTROLS</span></div><button type="button" onClick={reset}><RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" /> reset</button></div><SharedControls seriesId={seriesId} paths={paths} horizon={horizon} onSeries={setSeriesId} onPaths={setPaths} onHorizon={setHorizon} /><button id="scenario-compare-toggle" type="button" className={`scenario-compare-toggle ${comparisonEnabled ? 'is-active' : ''}`} aria-pressed={comparisonEnabled} onClick={() => setComparisonEnabled((current) => !current)}><ArrowLeftRight className="h-4 w-4" aria-hidden="true" /><span><b>Paired comparison</b><small>{comparisonEnabled ? 'Run B overlay is active' : 'Enable a second live run'}</small></span><i aria-hidden="true" /></button><RunControls id="a" title="Run A / reference" color="#7c9cff" config={runA} onChange={(patch) => updateRun('a', patch)} />{comparisonEnabled ? <RunControls id="b" title="Run B / challenger" color="#54e3b6" config={runB} onChange={(patch) => updateRun('b', patch)} /> : null}<button type="button" className="scenario-export" onClick={exportScenario}><Download className="h-4 w-4" aria-hidden="true" /> Export comparison state</button><div className="scenario-control-foot"><Info className="h-4 w-4" aria-hidden="true" /><p>All calculations remain in this browser. The export contains selected public-fixture inputs, comparison output, and historical-stress modifiers only.</p></div></aside><div className="scenario-results"><div className="scenario-result-rail"><div><span>RUN A P50</span><b>{formatValue(finalA, series.unit)}</b><small>{simulationA.futureLabels[finalIndex]} · {simulationA.stress.shortLabel}</small></div><div><span>RUN A DISPERSION</span><b>{simulationA.effectiveResidualSD.toFixed(2)}</b><small>after selected stress modifier</small></div><div><span>BOUND ACTIVATION</span><b>{(simulationA.clampRate * 100).toFixed(1)}%</b><small>{series.upper ? 'valid-scale cap if reached' : 'zero floor if reached'}</small></div><div><span>STRESS CASES</span><b>03</b><small>automated historical labels</small></div></div>{comparisonEnabled ? <><div className="scenario-comparison-grid"><EnvelopeChart series={series} simulation={simulationA} runLabel="Run A" accent="#7c9cff" compact /><EnvelopeChart series={series} simulation={simulationB} runLabel="Run B" accent="#54e3b6" compact /></div><OverlayChart series={series} first={simulationA} second={simulationB} /><ComparisonSummary series={series} first={simulationA} second={simulationB} /></> : <EnvelopeChart series={series} simulation={simulationA} runLabel="Run A" accent="#7c9cff" />}<StressSuite series={series} baseline={simulationA} cases={stressRuns} /><SensitivityChart series={series} simulation={simulationA} /><section className="scenario-method"><div><Sigma className="h-5 w-5" aria-hidden="true" /><div><span>MODEL TRACE / COMPARISON DISCLOSURE</span><h2>Runs differ only through their explicit inputs; the fixture boundary never changes.</h2></div></div><div className="scenario-method-grid"><p><b>Paired overlay</b> shares the fixture series, path count, and horizon so Run A and Run B remain comparable; seeds, trend, residual amplitude, and historical-stress labels are independent.</p><p><b>Stress suite</b> reuses Run A, then applies a fixed documented trend and residual modifier for each historical-regime label. It does not inject historical market returns into the fixture series.</p><p><b>Historical basis</b> draws on Federal Reserve and Library of Congress public history sources. The references describe the market periods; they do not calibrate a customer, product, or operational-loss model.</p><p><b>Public boundary</b> remains fixed: no live integrations, customer records, account data, market feed, probability estimate, or decision authority are present.</p></div></section><section className="scenario-provenance"><div><BarChart3 className="h-5 w-5" aria-hidden="true" /><div><span>FIXTURE PROVENANCE</span><b>{series.provenance}</b><p>{series.scope}</p></div></div><p>Output mode: public explanatory fixture · reader: public product visitor · source basis: documented historical-regime labels plus fixed fixture modifiers · receipt: none required because no evidence is delivered or retained.</p></section></div></section></main>;
}
