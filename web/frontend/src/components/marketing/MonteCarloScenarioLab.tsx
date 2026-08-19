'use client';

import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, BarChart3, ChevronDown, CircleDot, Download, Info, RefreshCcw, Sigma, SlidersHorizontal, Sparkles } from 'lucide-react';

type SeriesId = 'resolution-volume' | 'service-continuity';
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
type Percentiles = { readonly p10: readonly number[]; readonly p25: readonly number[]; readonly p50: readonly number[]; readonly p75: readonly number[]; readonly p90: readonly number[] };
type Simulation = {
  readonly slope: number;
  readonly slopeSE: number;
  readonly intercept: number;
  readonly residualSD: number;
  readonly percentiles: Percentiles;
  readonly finalSensitivity: readonly { readonly multiplier: number; readonly value: number }[];
  readonly clampRate: number;
  readonly futureLabels: readonly string[];
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

const PATH_OPTIONS = [1000, 2500, 5000, 10000] as const;
const clamp = (value: number, min: number, max?: number) => Math.min(Math.max(value, min), max ?? Number.POSITIVE_INFINITY);
const round = (value: number, digits = 1) => Number(value.toFixed(digits));
const number = (value: number, unit: string) => unit === '%' ? `${value.toFixed(1)}%` : `${Math.round(value)}`;

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
  const second = random();
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
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
  if (lower === upper) return sorted[lower]!;
  return sorted[lower]! + (sorted[upper]! - sorted[lower]!) * (index - lower);
}

function createFutureLabels(series: Series, horizon: number) {
  if (series.id === 'resolution-volume') return Array.from({ length: horizon }, (_, index) => `W${series.values.length + index + 1}`);
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan+', 'Feb+', 'Mar+', 'Apr+'];
  return months.slice(0, horizon);
}

function simulate(series: Series, seed: number, paths: number, horizon: number, trendMultiplier: number, residualMultiplier: number): Simulation {
  const fit = linearFit(series.values);
  const random = mulberry32(seed + (series.id === 'service-continuity' ? 811 : 0));
  const effectiveSlope = fit.slope * trendMultiplier;
  const samples = Array.from({ length: horizon }, () => [] as number[]);
  let clampCount = 0;
  for (let path = 0; path < paths; path += 1) {
    const sampledSlope = effectiveSlope + normal(random) * fit.slopeSE;
    for (let period = 0; period < horizon; period += 1) {
      const raw = fit.intercept + sampledSlope * (series.values.length + period + 1) + normal(random) * fit.residualSD * residualMultiplier;
      const bounded = clamp(raw, series.lower, series.upper);
      if (bounded !== raw) clampCount += 1;
      samples[period]!.push(bounded);
    }
  }
  samples.forEach((items) => items.sort((first, second) => first - second));
  const p10 = samples.map((items) => percentile(items, 0.1));
  const p25 = samples.map((items) => percentile(items, 0.25));
  const p50 = samples.map((items) => percentile(items, 0.5));
  const p75 = samples.map((items) => percentile(items, 0.75));
  const p90 = samples.map((items) => percentile(items, 0.9));
  const finalX = series.values.length + horizon;
  const finalSensitivity = [0.75, 1, 1.25].map((multiplier) => ({ multiplier, value: clamp(fit.intercept + fit.slope * multiplier * finalX, series.lower, series.upper) }));
  return { slope: effectiveSlope, slopeSE: fit.slopeSE, intercept: fit.intercept, residualSD: fit.residualSD, percentiles: { p10, p25, p50, p75, p90 }, finalSensitivity, clampRate: clampCount / Math.max(paths * horizon, 1), futureLabels: createFutureLabels(series, horizon) };
}

function pathFrom(values: readonly number[], min: number, max: number, start: number, step: number) {
  return values.map((value, index) => `${start + index * step},${82 - ((value - min) / Math.max(max - min, 1)) * 60}`).join(' ');
}

function areaPath(top: readonly number[], bottom: readonly number[], min: number, max: number, start: number, step: number) {
  const upper = pathFrom(top, min, max, start, step);
  const lower = [...bottom].reverse().map((value, reverseIndex) => `${start + (bottom.length - 1 - reverseIndex) * step},${82 - ((value - min) / Math.max(max - min, 1)) * 60}`).join(' ');
  return `${upper} ${lower}`;
}

function EnvelopeChart({ series, simulation }: { readonly series: Series; readonly simulation: Simulation }) {
  const allValues = [...series.values, ...simulation.percentiles.p10, ...simulation.percentiles.p90];
  const min = series.upper === 100 ? Math.max(0, Math.floor(Math.min(...allValues) / 2) * 2) : Math.max(0, Math.floor(Math.min(...allValues) - 6));
  const max = series.upper === 100 ? 100 : Math.ceil(Math.max(...allValues) + 6);
  const count = series.values.length + simulation.futureLabels.length;
  const step = 210 / Math.max(count - 1, 1);
  const historyPoints = pathFrom(series.values, min, max, 0, step);
  const forecastStart = series.values.length * step;
  const chartLabel = `${series.label} Monte Carlo scenario envelope; historical fixture values followed by P10 through P90 simulated scenario bands`;
  return <div className="scenario-chart" aria-live="polite"><div className="scenario-chart-top"><div><span>LIVE PERCENTILE ENVELOPE</span><b>{series.label}</b></div><small>P10–P90 fixture-path output</small></div><svg viewBox="0 0 220 112" preserveAspectRatio="none" role="img" aria-label={chartLabel}><title>{chartLabel}</title><rect x={forecastStart - step / 2} y="0" width={220 - forecastStart + step / 2} height="90" fill="rgba(84, 227, 182, .08)" /><line x1="0" x2="220" y1="22" y2="22" /><line x1="0" x2="220" y1="52" y2="52" /><line x1="0" x2="220" y1="82" y2="82" /><line x1={forecastStart - step / 2} x2={forecastStart - step / 2} y1="0" y2="90" className="scenario-divider" /><polygon points={areaPath(simulation.percentiles.p90, simulation.percentiles.p10, min, max, forecastStart, step)} className="scenario-band scenario-band-wide" /><polygon points={areaPath(simulation.percentiles.p75, simulation.percentiles.p25, min, max, forecastStart, step)} className="scenario-band" /><polyline points={historyPoints} className="scenario-history" style={{ stroke: series.color }} /><polyline points={pathFrom(simulation.percentiles.p50, min, max, forecastStart, step)} className="scenario-median" />{series.values.map((value, index) => <circle key={`${series.id}-${index}`} cx={index * step} cy={82 - ((value - min) / Math.max(max - min, 1)) * 60} r="2.8" fill={series.color} />)}{simulation.percentiles.p50.map((value, index) => <circle key={`p50-${index}`} cx={forecastStart + index * step} cy={82 - ((value - min) / Math.max(max - min, 1)) * 60} r="2.8" className="scenario-median-dot" />)}<text x={forecastStart + 2} y="10" className="scenario-chart-annotation">SIMULATED</text>{[min, (min + max) / 2, max].map((value, index) => <text key={`${series.id}-tick-${index}`} x="-1" y={85 - index * 30} className="scenario-axis-label">{series.unit === '%' ? `${Math.round(value)}%` : Math.round(value)}</text>)}</svg><div className="scenario-x-labels" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>{[...series.historicalLabels, ...simulation.futureLabels].map((label, index) => <span key={label} className={index >= series.values.length ? 'is-future' : ''}>{label}</span>)}</div><div className="scenario-legend"><span><i className="scenario-legend-history" style={{ backgroundColor: series.color }} />Fixture history</span><span><i className="scenario-legend-wide" />P10–P90</span><span><i className="scenario-legend-inner" />P25–P75</span><span><i className="scenario-legend-median" />P50</span></div></div>;
}

function SensitivityChart({ series, simulation }: { readonly series: Series; readonly simulation: Simulation }) {
  const max = series.upper ?? Math.max(...simulation.finalSensitivity.map((item) => item.value)) * 1.18;
  const reachedUpperBound = series.upper !== undefined && simulation.finalSensitivity.slice(1).some((item) => item.value >= series.upper!);
  return <div className="scenario-sensitivity"><div className="scenario-chart-top"><div><span>END-HORIZON SENSITIVITY</span><b>Trend slope stress test</b></div><small>Intercept held constant</small></div><div className="scenario-sensitivity-bars" role="img" aria-label={`${series.label} end-horizon sensitivity under low, baseline, and high fitted trend slope assumptions`}>{simulation.finalSensitivity.map((item) => <div key={item.multiplier}><span><i style={{ height: `${Math.max((item.value / max) * 100, 4)}%`, backgroundColor: item.multiplier === 1 ? series.color : item.multiplier < 1 ? '#71859b' : '#d38b1c' }} /><b>{number(item.value, series.unit)}</b></span><em>{item.multiplier.toFixed(2)}×</em></div>)}</div><p>{reachedUpperBound ? 'The base and high slope cases hit the valid 100% scale ceiling. This is a cap effect, not a claim of certainty.' : 'This checks directional sensitivity to the fitted slope only. It is not an outcome range or decision recommendation.'}</p></div>;
}

function RangeControl({ label, value, min, max, step, suffix, onChange }: { readonly label: string; readonly value: number; readonly min: number; readonly max: number; readonly step: number; readonly suffix: string; readonly onChange: (value: number) => void }) {
  const id = `scenario-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return <label className="scenario-control" htmlFor={id}><span><b>{label}</b><output>{suffix === '×' ? `${value.toFixed(2)}×` : suffix === '%' ? `${value.toFixed(0)}%` : `${value}`}</output></span><input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /><small>{min}{suffix} <i aria-hidden="true" /> {max}{suffix}</small></label>;
}

export function MonteCarloScenarioLab() {
  const [seriesId, setSeriesId] = useState<SeriesId>('resolution-volume');
  const [seed, setSeed] = useState(20260819);
  const [paths, setPaths] = useState<(typeof PATH_OPTIONS)[number]>(5000);
  const [horizon, setHorizon] = useState(4);
  const [trendMultiplier, setTrendMultiplier] = useState(1);
  const [residualMultiplier, setResidualMultiplier] = useState(1);
  const series = SERIES[seriesId];
  const simulation = useMemo(() => simulate(series, seed, paths, horizon, trendMultiplier, residualMultiplier), [series, seed, paths, horizon, trendMultiplier, residualMultiplier]);
  const finalIndex = horizon - 1;
  const finalValues = { p10: simulation.percentiles.p10[finalIndex]!, p50: simulation.percentiles.p50[finalIndex]!, p90: simulation.percentiles.p90[finalIndex]! };
  const reset = () => { setSeed(20260819); setPaths(5000); setHorizon(4); setTrendMultiplier(1); setResidualMultiplier(1); };
  const exportScenario = () => {
    const payload = { product: 'RipoDoc Monte Carlo Scenario Lab', fixtureOnly: true, generatedAt: new Date().toISOString(), parameters: { series: series.label, seed, paths, horizon, trendMultiplier, residualMultiplier }, result: { p10: simulation.percentiles.p10.map((value) => round(value, 4)), p25: simulation.percentiles.p25.map((value) => round(value, 4)), p50: simulation.percentiles.p50.map((value) => round(value, 4)), p75: simulation.percentiles.p75.map((value) => round(value, 4)), p90: simulation.percentiles.p90.map((value) => round(value, 4)), finalSensitivity: simulation.finalSensitivity.map((item) => ({ multiplier: item.multiplier, value: round(item.value, 4) })), clampRate: simulation.clampRate, methodology: 'Seeded fixture-only sampling; not a production forecast, probability, or decision tool.' } };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'ripodoc-fixture-scenario.json'; anchor.click(); URL.revokeObjectURL(url);
  };
  return <main className="scenario-lab"><section className="scenario-lab-hero"><div><p className="dense-kicker">INTERACTIVE MONTE CARLO SCENARIO LAB</p><h1>Adjust the assumptions. Watch the fixture envelope respond.</h1><p>Run a transparent browser-side scenario stress test against RipoDoc&apos;s public demonstration series. Every control updates the percentile envelope and end-horizon sensitivity in real time.</p><div className="scenario-hero-pills"><span><Sparkles className="h-4 w-4" aria-hidden="true" /> seeded browser engine</span><span><Activity className="h-4 w-4" aria-hidden="true" /> live percentile bands</span><span><CircleDot className="h-4 w-4" aria-hidden="true" /> fixture only</span></div></div><aside><span>ACTIVE MODEL</span><b>{series.label.toUpperCase()}</b><p>{paths.toLocaleString()} paths · seed {seed} · {horizon}-period horizon</p><i aria-hidden="true" /></aside></section><section className="scenario-boundary" aria-label="Scenario lab interpretation boundary"><AlertTriangle className="h-5 w-5" aria-hidden="true" /><p><b>Interpretation boundary:</b> this tool visualizes public product fixtures under selected assumptions. It is not customer data, a prediction, a probability of real-world performance, a service commitment, or a decision recommendation.</p></section><section className="scenario-workbench"><aside className="scenario-controls"><div className="scenario-controls-head"><div><SlidersHorizontal className="h-5 w-5" aria-hidden="true" /><span>SCENARIO CONTROLS</span></div><button type="button" onClick={reset}><RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" /> reset</button></div><label className="scenario-select" htmlFor="scenario-series"><span><b>Fixture series</b><small>Selects a distinct public demo dataset</small></span><select id="scenario-series" value={seriesId} onChange={(event) => setSeriesId(event.target.value as SeriesId)}><option value="resolution-volume">Resolution volume</option><option value="service-continuity">Service continuity</option></select><ChevronDown className="h-4 w-4" aria-hidden="true" /></label><label className="scenario-select" htmlFor="scenario-paths"><span><b>Simulation paths</b><small>More paths make percentile summaries smoother</small></span><select id="scenario-paths" value={paths} onChange={(event) => setPaths(Number(event.target.value) as (typeof PATH_OPTIONS)[number])}>{PATH_OPTIONS.map((option) => <option key={option} value={option}>{option.toLocaleString()} paths</option>)}</select><ChevronDown className="h-4 w-4" aria-hidden="true" /></label><label className="scenario-seed" htmlFor="scenario-seed"><span><b>Deterministic seed</b><small>Same inputs and seed produce the same fixture paths</small></span><input id="scenario-seed" type="number" value={seed} min={1} max={99999999} onChange={(event) => setSeed(Math.max(1, Number(event.target.value) || 1))} /></label><RangeControl label="Horizon" value={horizon} min={2} max={8} step={1} suffix=" periods" onChange={setHorizon} /><RangeControl label="Trend multiplier" value={trendMultiplier} min={0.5} max={1.5} step={0.05} suffix="×" onChange={setTrendMultiplier} /><RangeControl label="Residual amplitude" value={residualMultiplier} min={0.25} max={2} step={0.05} suffix="×" onChange={setResidualMultiplier} /><button type="button" className="scenario-export" onClick={exportScenario}><Download className="h-4 w-4" aria-hidden="true" /> Export current scenario</button><div className="scenario-control-foot"><Info className="h-4 w-4" aria-hidden="true" /><p>All computation stays in this browser. The export contains only the selected public fixture parameters and computed scenario output.</p></div></aside><div className="scenario-results"><div className="scenario-result-rail"><div><span>FITTED TREND</span><b>{simulation.slope >= 0 ? '+' : ''}{simulation.slope.toFixed(2)} / period</b><small>selected trend assumption</small></div><div><span>RESIDUAL SD</span><b>{(simulation.residualSD * residualMultiplier).toFixed(2)}</b><small>fixture dispersion input</small></div><div><span>BOUND ACTIVATION</span><b>{(simulation.clampRate * 100).toFixed(1)}%</b><small>{series.upper ? 'valid-scale cap applied' : 'zero floor applied if needed'}</small></div><div><span>FINAL P50</span><b>{number(finalValues.p50, series.unit)}</b><small>{simulation.futureLabels[finalIndex]} fixture-path median</small></div></div><EnvelopeChart series={series} simulation={simulation} /><div className="scenario-percentile-table"><div><span>END-HORIZON PERCENTILES</span><b>{simulation.futureLabels[finalIndex]} / selected fixture assumptions</b></div><table><thead><tr><th>Percentile</th><th>P10</th><th>P25</th><th>P50</th><th>P75</th><th>P90</th></tr></thead><tbody><tr><th>{series.shortLabel}</th><td>{number(finalValues.p10, series.unit)}</td><td>{number(simulation.percentiles.p25[finalIndex]!, series.unit)}</td><td>{number(finalValues.p50, series.unit)}</td><td>{number(simulation.percentiles.p75[finalIndex]!, series.unit)}</td><td>{number(finalValues.p90, series.unit)}</td></tr></tbody></table></div><SensitivityChart series={series} simulation={simulation} /><section className="scenario-method"><div><Sigma className="h-5 w-5" aria-hidden="true" /><div><span>MODEL TRACE</span><h2>What changes—and what does not—when you move a control.</h2></div></div><div className="scenario-method-grid"><p><b>Trend multiplier</b> adjusts the fitted historical slope before scenarios are sampled.</p><p><b>Residual amplitude</b> scales the fixture&apos;s in-sample residual dispersion for each simulated future period.</p><p><b>Seed and paths</b> make sampling reproducible and let you compare stable output across runs.</p><p><b>Public boundary</b> remains fixed: no live integrations, account data, customer records, or decision authority are present.</p></div></section><section className="scenario-provenance"><div><BarChart3 className="h-5 w-5" aria-hidden="true" /><div><span>FIXTURE PROVENANCE</span><b>{series.provenance}</b><p>{series.scope}</p></div></div><p>Output mode: interactive explanatory product fixture · reader: public product visitor · receipt: none required because no evidence is delivered or retained.</p></section></div></section></main>;
}
