'use client';

import { useMemo, useState } from 'react';
import { Activity, BarChart3, CheckCircle2, ChevronRight, CircleAlert, Clock3, Database, FileCheck2, Filter, Grid3X3, LockKeyhole, MousePointer2, PieChart, ReceiptText, ShieldCheck, X } from 'lucide-react';

type ChartKind = 'bar' | 'line' | 'pie' | 'heatmap' | 'comparison' | 'radial';
type Segment = { readonly label: string; readonly value: number; readonly color: string };
type FixtureChart = {
  readonly id: string;
  readonly kind: ChartKind;
  readonly title: string;
  readonly subtitle: string;
  readonly readout: string;
  readonly delta: string;
  readonly accent: string;
  readonly detail: string;
  readonly provenance: string;
  readonly scope: string;
  readonly reader: string;
  readonly receiptState: string;
  readonly values?: readonly number[];
  readonly labels?: readonly string[];
  readonly segments?: readonly Segment[];
  readonly matrix?: readonly (readonly number[])[];
  readonly xLabels?: readonly string[];
  readonly yLabels?: readonly string[];
};

const CHARTS: readonly FixtureChart[] = [
  {
    id: 'resolution-volume', kind: 'bar', title: 'Resolution volume', subtitle: 'Fixture tickets closed by week', readout: '58', delta: '+13.7%', accent: '#7c9cff',
    values: [24, 31, 27, 38, 44, 42, 51, 58], labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    detail: 'The latest fixture week closes with 58 reviewed support events. The bars are a time-windowed explanation of one report condition—not a customer workload export.',
    provenance: 'Approved fixture service-event ledger', scope: 'Eight reporting weeks / resolved records only', reader: 'Fixture service-review owner', receiptState: 'Weekly support evidence selected',
  },
  {
    id: 'service-continuity', kind: 'line', title: 'Service continuity', subtitle: 'Fixture recovery confidence trend', readout: '97.8%', delta: '+4.2 pts', accent: '#54e3b6',
    values: [89.6, 91.1, 90.4, 93.2, 94.8, 94.1, 96.7, 97.8], labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    detail: 'The line follows a distinct service-continuity fixture over eight review points. It is intentionally separate from ticket resolution counts and does not infer a client-wide reliability score.',
    provenance: 'Reviewed fixture recovery-verification register', scope: 'Eight review points / continuity criterion only', reader: 'Fixture operations sponsor', receiptState: 'Continuity review is ready to deliver',
  },
  {
    id: 'evidence-composition', kind: 'pie', title: 'Evidence composition', subtitle: 'What the selected answer is built from', readout: '100%', delta: '6 layers', accent: '#f6c177',
    segments: [
      { label: 'Source mapping', value: 28, color: '#7c9cff' }, { label: 'Approved rows', value: 24, color: '#54e3b6' }, { label: 'Review note', value: 16, color: '#f6c177' },
      { label: 'Reader condition', value: 14, color: '#b596ff' }, { label: 'Time window', value: 10, color: '#ff7a92' }, { label: 'Receipt state', value: 8, color: '#8ca0b9' },
    ],
    detail: 'The pie is a deliberately different categorical fixture: it shows how a selected answer is assembled from source, review, scope, reader, timing, and receipt conditions.',
    provenance: 'Fixture publication-plan composition', scope: 'One selected report answer / six control layers', reader: 'Fixture publication reviewer', receiptState: 'Evidence composition reviewed',
  },
  {
    id: 'review-heatmap', kind: 'heatmap', title: 'Review activity heatmap', subtitle: 'Fixture review events by day and window', readout: '42', delta: '5 × 7 map', accent: '#ff7a92',
    matrix: [[2, 3, 1, 4, 5, 1, 0], [4, 6, 3, 5, 7, 2, 1], [7, 9, 6, 8, 10, 4, 2], [5, 8, 4, 6, 9, 3, 1], [3, 5, 2, 4, 6, 2, 1]],
    xLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], yLabels: ['08:00', '10:00', '12:00', '14:00', '16:00'],
    detail: 'Each square is a separate fixture review-activity measure. The heatmap adds timing context without exposing a staff roster, customer record, or raw event feed.',
    provenance: 'Aggregated fixture review-event timeline', scope: 'Five daytime windows / seven-day review pattern', reader: 'Fixture delivery coordinator', receiptState: 'Aggregated review timing selected',
  },
  {
    id: 'exception-concentration', kind: 'comparison', title: 'Exception concentration', subtitle: 'Fixture control exceptions by domain', readout: '38', delta: '5 domains', accent: '#ff7a92',
    values: [12, 6, 9, 4, 7], labels: ['Patch', 'MFA', 'Backup', 'Access', 'Asset'],
    detail: 'The comparison panel isolates named fixture exception groups so a reader can decide where to inspect next. It is not a vulnerability inventory and contains no client environment identifiers.',
    provenance: 'Approved fixture control-status register', scope: 'Five named control groups / reviewed exceptions only', reader: 'Fixture security decision owner', receiptState: 'Exception set constrained for decision',
  },
  {
    id: 'delivery-readiness', kind: 'radial', title: 'Delivery readiness', subtitle: 'Fixture answer-control completion', readout: '82%', delta: '4 of 5 ready', accent: '#54e3b6',
    values: [100, 100, 84, 76, 50], labels: ['Claim', 'Source', 'Scope', 'Reader', 'Receipt'],
    detail: 'The readiness ring is a third kind of measurement: it scores only whether required control conditions are present in this illustrative fixture, not whether an organization is secure or compliant.',
    provenance: 'Fixture delivery-control checklist', scope: 'Five product conditions / one prepared answer', reader: 'Fixture release reviewer', receiptState: 'Receipt condition remains under review',
  },
] as const;

const FIXTURE_ROWS = [
  ['NG-40412', 'Teams retention review', 'T. Brennan', '2.0h', 'Approved'], ['NG-40411', 'Account unlock after lockout', 'S. Lindqvist', '3.8h', 'Reviewed'],
  ['NG-40410', 'Practice software upgrade', 'M. Adeyemi', '5.2h', 'Approved'], ['NG-40409', 'Finance share permissions', 'S. Lindqvist', '1.7h', 'Scoped'],
  ['NG-40408', 'Endpoint definition update', 'M. Adeyemi', '2.5h', 'Reviewed'],
] as const;

const TYPE_LABELS: Record<ChartKind, string> = { bar: 'BAR / VOLUME', line: 'LINE / TREND', pie: 'PIE / MIX', heatmap: 'HEATMAP / TIMING', comparison: 'COMPARE / DOMAIN', radial: 'RING / READINESS' };

export function FixtureReportDesk() {
  const [active, setActive] = useState(CHARTS[0]?.id ?? 'resolution-volume');
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const activeChart = useMemo(() => CHARTS.find((chart) => chart.id === active) ?? CHARTS[0]!, [active]);
  const tooltip = CHARTS.find((chart) => chart.id === hovered);
  const activate = (id: string) => { setActive(id); setOpen(true); };
  return <section id="proof-desk" className="proof-desk proof-observatory" aria-label="Interactive fixture report desk">
    <header className="proof-desk-header">
      <div><p className="dense-kicker">INTERACTIVE PROOF OBSERVATORY</p><h2>See the report. Then inspect every independent evidence shape behind the answer.</h2><p>This public experience uses demonstration fixtures only. Nothing here is customer data, a client deployment, or a live integration.</p></div>
      <div className="proof-desk-header-status"><span><i aria-hidden="true" /> FIXTURE ENVIRONMENT</span><b>06 DATA MODES / 42 READOUTS</b><small>Hover any card, then select it to open its controlled inspection.</small></div>
    </header>
    <div className="proof-desk-grid">
      <div className="fixture-report fixture-report-rich">
        <div className="fixture-report-top"><div><span>RIPODOC / CLIENT OPERATIONS REVIEW</span><h3>Quarterly Evidence Observatory</h3><p>Harbourview Legal · Q2 2026 · Safe public fixture</p></div><div className="fixture-report-badges"><span><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> REVIEWED</span><span><LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> BOUNDED</span><span><Activity className="h-3.5 w-3.5" aria-hidden="true" /> LIVE FIXTURE</span></div></div>
        <div className="fixture-command-rail" aria-label="Fixture report state"><span>DATA SURFACE / ACTIVE</span><b>6 distinct visualization families</b><p>Each panel draws from its own intentionally scoped demonstration dataset.</p><i aria-hidden="true" /></div>
        <div className="fixture-kpis fixture-kpis-rich"><Metric value="412" label="tickets resolved" status="volume fixture" /><Metric value="98.6%" label="patch compliance" status="approved claim" /><Metric value="14" label="open exceptions" status="decision required" /><Metric value="42" label="review events" status="heatmap fixture" /><Metric value="6" label="proof layers" status="pie composition" /><Metric value="82%" label="delivery ready" status="receipt gate" /></div>
        <div className="fixture-chart-grid fixture-chart-grid-rich">{CHARTS.map((chart) => <ChartCard key={chart.id} chart={chart} active={active === chart.id} onActivate={() => activate(chart.id)} onHover={(enter) => setHovered(enter ? chart.id : null)} />)}</div>
        <div className="fixture-table"><div><span>APPROVED SUPPORTING ROWS</span><button type="button" onClick={() => setOpen(true)}><Filter className="h-3.5 w-3.5" aria-hidden="true" /> scope is active</button></div><table><thead><tr><th>Fixture ID</th><th>Approved support</th><th>Reviewer</th><th>Effort</th><th>State</th><th aria-label="Open" /></tr></thead><tbody>{FIXTURE_ROWS.map((row) => <tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td><span className="fixture-row-state">{row[4]}</span></td><td><button type="button" aria-label={`Inspect ${row[0]}`} onClick={() => activate('resolution-volume')}><ChevronRight className="h-4 w-4" aria-hidden="true" /></button></td></tr>)}</tbody></table></div>
      </div>
      <aside className={`fixture-inspector fixture-inspector-rich ${open ? 'is-open' : ''}`} aria-live="polite">
        <div className="fixture-inspector-heading"><div><span>INSPECTION PANEL / {TYPE_LABELS[activeChart.kind]}</span><h3>{activeChart.title}</h3></div><button type="button" onClick={() => setOpen(false)} aria-label="Close fixture inspection"><X className="h-4 w-4" aria-hidden="true" /></button></div>
        <div className="fixture-inspector-visual"><ChartRenderer chart={activeChart} compact={false} /></div>
        <div className="fixture-inspector-insight"><MousePointer2 className="h-4 w-4" aria-hidden="true" /><p>{activeChart.detail}</p></div>
        <div className="fixture-provenance"><p><Database className="h-4 w-4" aria-hidden="true" /> PROVENANCE</p><strong>{activeChart.provenance}</strong><span>Structured report-supporting fixture · independent dataset · reviewed before release</span></div>
        <dl className="fixture-facts"><div><dt><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Scope</dt><dd>{activeChart.scope}</dd></div><div><dt><Clock3 className="h-4 w-4" aria-hidden="true" /> Reader window</dt><dd>{activeChart.reader} · 14-day decision window</dd></div><div><dt><FileCheck2 className="h-4 w-4" aria-hidden="true" /> Review</dt><dd>Fixture reviewer confirmed source, scope, visualization context, and delivery posture.</dd></div></dl>
        <div className="fixture-receipt"><div><span><ReceiptText className="h-4 w-4" aria-hidden="true" /> PROOF DELIVERY RECEIPT</span><CheckCircle2 className="h-4 w-4" aria-hidden="true" /></div><p>{activeChart.receiptState.toUpperCase()}</p><dl><dt>Claim</dt><dd>{activeChart.title}</dd><dt>Reader</dt><dd>Fixture client sponsor</dd><dt>Condition</dt><dd>Bounded and revocable</dd><dt>State</dt><dd>Receipt visible after open</dd></dl></div>
        <p className="fixture-disclaimer"><CircleAlert className="h-3.5 w-3.5" aria-hidden="true" /> This is an illustrative product fixture. It does not show a customer, account, report, token, or client evidence.</p>
      </aside>
    </div>
    {tooltip && <div className="proof-desk-tooltip" role="tooltip"><b>{tooltip.title} · {TYPE_LABELS[tooltip.kind]}</b><span>{tooltip.detail}</span><small>{tooltip.readout} / {tooltip.delta}</small></div>}
  </section>;
}

function Metric({ value, label, status }: { readonly value: string; readonly label: string; readonly status: string }) { return <article><strong>{value}</strong><span>{label}</span><small>{status}</small></article>; }

function ChartCard({ chart, active, onActivate, onHover }: { readonly chart: FixtureChart; readonly active: boolean; readonly onActivate: () => void; readonly onHover: (enter: boolean) => void }) {
  const Icon = chart.kind === 'pie' ? PieChart : chart.kind === 'heatmap' ? Grid3X3 : chart.kind === 'line' ? Activity : BarChart3;
  return <button type="button" onClick={onActivate} onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)} onFocus={() => onHover(true)} onBlur={() => onHover(false)} className={`fixture-chart fixture-chart-${chart.kind} ${active ? 'is-active' : ''}`} aria-pressed={active}>
    <span className="fixture-chart-heading"><span><b>{chart.title}</b><small>{chart.subtitle}</small></span><i><Icon className="h-3.5 w-3.5" aria-hidden="true" /> {TYPE_LABELS[chart.kind]}</i></span>
    <ChartRenderer chart={chart} compact />
    <span className="fixture-chart-readout"><strong>{chart.readout}</strong><em>{chart.delta}</em></span>
    <span className="fixture-chart-foot"><span>hover / select data</span><ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
  </button>;
}

function ChartRenderer({ chart, compact }: { readonly chart: FixtureChart; readonly compact: boolean }) {
  if (chart.kind === 'bar') return <BarView values={chart.values ?? []} labels={chart.labels ?? []} accent={chart.accent} compact={compact} />;
  if (chart.kind === 'line') return <LineView values={chart.values ?? []} labels={chart.labels ?? []} accent={chart.accent} compact={compact} />;
  if (chart.kind === 'pie') return <PieView segments={chart.segments ?? []} compact={compact} />;
  if (chart.kind === 'heatmap') return <HeatmapView matrix={chart.matrix ?? []} xLabels={chart.xLabels ?? []} yLabels={chart.yLabels ?? []} compact={compact} />;
  if (chart.kind === 'comparison') return <ComparisonView values={chart.values ?? []} labels={chart.labels ?? []} accent={chart.accent} compact={compact} />;
  return <RadialView values={chart.values ?? []} labels={chart.labels ?? []} accent={chart.accent} compact={compact} />;
}

function BarView({ values, labels, accent, compact }: { readonly values: readonly number[]; readonly labels: readonly string[]; readonly accent: string; readonly compact: boolean }) { const max = Math.max(...values, 1); return <span className={`fixture-bars fixture-bars-rich ${compact ? 'is-compact' : ''}`} role="img" aria-label="Fixture resolution volume bar chart">{values.map((value, index) => <span key={`${labels[index]}-${value}`}><i style={{ height: `${Math.max((value / max) * 86, 8)}%`, backgroundColor: accent }} /><b>{value}</b><em>{labels[index]}</em></span>)}</span>; }

function LineView({ values, labels, accent, compact }: { readonly values: readonly number[]; readonly labels: readonly string[]; readonly accent: string; readonly compact: boolean }) { const min = Math.min(...values); const max = Math.max(...values); const scale = Math.max(max - min, 1); const points = values.map((value, index) => `${index * (200 / Math.max(values.length - 1, 1))},${74 - ((value - min) / scale) * 56}`).join(' '); return <span className={`fixture-line ${compact ? 'is-compact' : ''}`} role="img" aria-label="Fixture service continuity line chart"><svg viewBox="0 0 200 86" preserveAspectRatio="none"><defs><linearGradient id="fixture-line-fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor={accent} stopOpacity=".35" /><stop offset="1" stopColor={accent} stopOpacity="0" /></linearGradient></defs><path d={`M 0 82 L ${points} L 200 82 Z`} fill="url(#fixture-line-fill)" /><polyline points={points} fill="none" stroke={accent} strokeWidth="3" vectorEffect="non-scaling-stroke" />{values.map((value, index) => <circle key={labels[index]} cx={index * (200 / Math.max(values.length - 1, 1))} cy={74 - ((value - min) / scale) * 56} r="3.2" fill={accent} />)}</svg><span>{labels.map((label) => <em key={label}>{label}</em>)}</span></span>; }

function PieView({ segments, compact }: { readonly segments: readonly Segment[]; readonly compact: boolean }) { const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1; const stops = segments.reduce<{ readonly position: number; readonly values: readonly string[] }>((state, segment) => { const next = state.position + (segment.value / total) * 100; return { position: next, values: [...state.values, `${segment.color} ${state.position}% ${next}%`] }; }, { position: 0, values: [] }).values.join(', '); return <span className={`fixture-pie ${compact ? 'is-compact' : ''}`} role="img" aria-label="Fixture evidence composition pie chart"><i style={{ background: `conic-gradient(${stops})` }}><b>{total}%</b><small>SCOPED</small></i><span>{segments.slice(0, compact ? 3 : segments.length).map((segment) => <em key={segment.label}><i style={{ backgroundColor: segment.color }} />{segment.label}<b>{segment.value}%</b></em>)}</span></span>; }

function HeatmapView({ matrix, xLabels, yLabels, compact }: { readonly matrix: readonly (readonly number[])[]; readonly xLabels: readonly string[]; readonly yLabels: readonly string[]; readonly compact: boolean }) { const max = Math.max(...matrix.flat(), 1); return <span className={`fixture-heatmap ${compact ? 'is-compact' : ''}`} role="img" aria-label="Fixture review activity heatmap"><span className="fixture-heatmap-y">{(compact ? yLabels.slice(0, 3) : yLabels).map((label) => <em key={label}>{label}</em>)}</span><span className="fixture-heatmap-body"><span>{xLabels.map((label) => <em key={label}>{label}</em>)}</span><span>{matrix.slice(0, compact ? 3 : matrix.length).flatMap((row, rowIndex) => row.map((value, columnIndex) => <i key={`${rowIndex}-${columnIndex}`} title={`${yLabels[rowIndex]} ${xLabels[columnIndex]}: ${value} fixture reviews`} style={{ backgroundColor: `rgba(255, 122, 146, ${0.14 + (value / max) * 0.78})` }} />))}</span></span></span>; }

function ComparisonView({ values, labels, accent, compact }: { readonly values: readonly number[]; readonly labels: readonly string[]; readonly accent: string; readonly compact: boolean }) { const max = Math.max(...values, 1); return <span className={`fixture-comparison ${compact ? 'is-compact' : ''}`} role="img" aria-label="Fixture exception concentration comparison chart">{values.map((value, index) => <span key={labels[index]}><em>{labels[index]}</em><i><b style={{ width: `${(value / max) * 100}%`, backgroundColor: index === 0 ? accent : '#52637c' }} /></i><strong>{value}</strong></span>)}</span>; }

function RadialView({ values, labels, accent, compact }: { readonly values: readonly number[]; readonly labels: readonly string[]; readonly accent: string; readonly compact: boolean }) { const total = Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1)); return <span className={`fixture-radial ${compact ? 'is-compact' : ''}`} role="img" aria-label="Fixture delivery readiness ring chart"><i style={{ background: `conic-gradient(${accent} ${total}%, #26354b ${total}% 100%)` }}><b>{total}%</b><small>READY</small></i><span>{labels.map((label, index) => <em key={label}><b className={values[index]! >= 80 ? 'is-ready' : ''} />{label}<strong>{values[index]}%</strong></em>)}</span></span>; }
