/**
 * Deterministic generator for the shipped demo fixture.
 *
 * The demo manifest is the artifact every prospect sees, and a demo whose
 * headline claims 412 tickets but whose table shows 6 rows disproves the
 * product more effectively than any competitor could — `demo-fixture.test.ts`
 * pins that invariant. This script makes the two shipped copies (the PDF
 * generator's and the web app's) large enough and honest enough for a
 * reviewer: every count KPI's underlying table carries exactly that many rows.
 *
 * The rows are generated deterministically so the output is stable across
 * runs. Change the generator, re-run it, and both fixture copies are
 * regenerated together — they cannot drift.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');

const OUT = [
  join(ROOT, 'tools', 'evidence-pdf', 'fixtures', 'demo-report.json'),
  join(ROOT, 'web', 'frontend', 'content', 'reports', 'rpt-demo-0001.json'),
];

/** Deterministic PRNG so re-running the script produces identical bytes. */
const mulberry32 = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const OWNERS = ['R. Okafor', 'S. Lindqvist', 'M. Adeyemi', 'T. Brennan'] as const;

const WORKLOADS = [
  'User account unlock after lockout',
  'Outlook mailbox re-indexing',
  'New starter laptop build',
  'Printer driver update, floor 2',
  'VPN certificate renewal',
  'Shared mailbox permission fix',
  'Wi-Fi dead zone survey, conference wing',
  'Citrix workspace reinstall',
  'Shared drive permissions for finance',
  'Backup job failure on HV-SRV-002',
  'Teams meeting recording retention',
  'Scanner firmware update',
  'MFA enrolment for new joiner',
  'Server patching window, HV-SRV-001',
  'Email alias creation for legal team',
  'Disk space investigation — email archive',
  'Desk phone provisioning, floor 1',
  'Endpoint antivirus definition update',
  'OneDrive sync issue — user profile',
  'Password reset for shared service account',
  'File server share permission review',
  'Vendor software upgrade — practice management',
  'Outlook add-in crash investigation',
  'New workstation deployment, HR',
  'Network switch config backup',
  'Intranet certificate expiry fix',
  'Phone system voicemail-to-email setup',
  'Laptop BIOS update, finance cohort',
  'Firewall rule request — partner VPN',
  'SharePoint list import for projects',
] as const;

const MONTHS = [
  '2026-04',
  '2026-04',
  '2026-04',
  '2026-05',
  '2026-05',
  '2026-05',
  '2026-06',
  '2026-06',
  '2026-06',
] as const;

interface TicketRow {
  readonly ticket: string;
  readonly summary: string;
  readonly owner: string;
  readonly hours: number;
  readonly resolvedAt: string;
}

/** Generate `count` tickets deterministically and sort by id. */
const generateTickets = (count: number): readonly TicketRow[] => {
  const rand = mulberry32(0x514f444f); // "RIPO" — stabilises the generated dataset
  const rows: TicketRow[] = [];

  for (let index = 0; index < count; index += 1) {
    const id = count - index; // NG-40293, NG-40292, … so the id walks downward
    const owner = OWNERS[Math.floor(rand() * OWNERS.length)]!;
    const summary = WORKLOADS[Math.floor(rand() * WORKLOADS.length)]!;
    const hours = Math.round((rand() * 6 + 0.25) * 100) / 100;
    const month = MONTHS[Math.floor(rand() * MONTHS.length)]!;
    const day = String(1 + Math.floor(rand() * 28)).padStart(2, '0');
    rows.push({
      ticket: `NG-${String(40000 + id).padStart(5, '0')}`,
      summary,
      owner,
      hours,
      resolvedAt: `${month}-${day}T${String(Math.floor(rand() * 9 + 8)).padStart(2, '0')}:${String(
        Math.floor(rand() * 60),
      ).padStart(2, '0')}:00Z`,
    });
  }

  return rows.sort((a, b) => b.ticket.localeCompare(a.ticket));
};

/** Generate `count` SLA breaches deterministically. */
const generateSlaBreaches = (count: number): readonly Record<string, string | number>[] => {
  const rand = mulberry32(0x534c4131); // "SLA1"
  const targets = ['First response 1h', 'Resolution 8h', 'Resolution 24h'] as const;
  const causes = [
    'Out-of-hours volume spike',
    'Vendor escalation',
    'Awaiting client access',
    'Hardware RMA delay',
    'Public holiday cover',
  ] as const;

  const rows: Record<string, string | number>[] = [];
  for (let index = 0; index < count; index += 1) {
    const target = targets[Math.floor(rand() * targets.length)]!;
    const cause = causes[Math.floor(rand() * causes.length)]!;
    const overInMinutes = Math.round(rand() * 190 + 5);
    const hours = Math.floor(overInMinutes / 60);
    const minutes = overInMinutes % 60;
    rows.push({
      ticket: `NG-${String(40100 + Math.floor(rand() * 900)).padStart(5, '0')}`,
      target,
      overBy: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      cause,
    });
  }
  return rows;
};

const generator = (): string => {
  const tickets = generateTickets(412);

  const manifest = {
    reportId: 'rpt-demo-0001',
    version: 3,
    title: 'Quarterly Business Review',
    provider: 'Northgate Managed IT',
    client: 'Harbourview Legal',
    periodLabel: 'Q2 2026 · 1 Apr – 30 Jun',
    publishedAt: '2026-07-02T09:15:00Z',
    recipient: {
      name: 'Dana Whitfield',
      email: 'dana.whitfield@harbourviewlegal.example',
    },
    elements: [
      {
        id: 'tickets-resolved',
        kind: 'kpi',
        label: 'Tickets resolved',
        value: '412',
        caption: '+8% vs Q1 2026',
        evidence: {
          title: 'Tickets resolved in Q2 2026',
          summary:
            'All 412 tickets closed between 1 Apr and 30 Jun 2026. Every one is listed below.',
          table: {
            columns: [
              { key: 'ticket', label: 'Ticket' },
              { key: 'summary', label: 'Summary' },
              { key: 'owner', label: 'Resolved by' },
              { key: 'hours', label: 'Hours', align: 'right' },
              { key: 'resolvedAt', label: 'Resolved' },
            ],
            rows: tickets,
          },
          provenance: {
            sourceSystem: 'PSA — ticket export',
            sourceQuery:
              'status = closed AND closed_at BETWEEN 2026-04-01 AND 2026-06-30 ORDER BY ticket_id',
            approvedBy: 'Priya Raman (vCIO)',
            approvedAt: '2026-07-01T16:40:00Z',
          },
        },
      },
      {
        id: 'sla-attainment',
        kind: 'kpi',
        label: 'SLA attainment',
        value: '97.4%',
        caption: 'Target 95% · 11 breaches',
        evidence: {
          title: 'SLA breaches in Q2 2026',
          summary:
            '11 of 412 tickets missed their response or resolution target. Every breach is listed below.',
          table: {
            columns: [
              { key: 'ticket', label: 'Ticket' },
              { key: 'target', label: 'Target missed' },
              { key: 'overBy', label: 'Over by' },
              { key: 'cause', label: 'Cause' },
            ],
            rows: generateSlaBreaches(11),
          },
          provenance: {
            sourceSystem: 'PSA — SLA report',
            sourceQuery: 'sla_state = breached AND period = 2026-Q2',
            approvedBy: 'Priya Raman (vCIO)',
            approvedAt: '2026-07-01T16:44:00Z',
          },
        },
      },
      {
        id: 'assets-at-risk',
        kind: 'kpi',
        label: 'Assets at risk',
        value: '14',
        caption: 'Out of warranty or unsupported OS',
        evidence: {
          title: 'The 14 assets flagged at risk',
          summary:
            'Every asset counted in the headline figure, with the reason it was flagged.',
          table: {
            columns: [
              { key: 'asset', label: 'Asset' },
              { key: 'type', label: 'Type' },
              { key: 'reason', label: 'Reason flagged' },
              { key: 'age', label: 'Age (yrs)', align: 'right' },
            ],
            rows: [
              { asset: 'HV-WKS-014', type: 'Workstation', reason: 'Warranty expired 2026-02-11', age: 5.4 },
              { asset: 'HV-WKS-021', type: 'Workstation', reason: 'Warranty expired 2026-03-02', age: 5.2 },
              { asset: 'HV-WKS-033', type: 'Workstation', reason: 'Unsupported OS build', age: 4.9 },
              { asset: 'HV-WKS-047', type: 'Workstation', reason: 'Unsupported OS build', age: 4.8 },
              { asset: 'HV-NB-008', type: 'Laptop', reason: 'Warranty expired 2025-12-19', age: 5.7 },
              { asset: 'HV-NB-012', type: 'Laptop', reason: 'Battery health below 60%', age: 4.1 },
              { asset: 'HV-SRV-002', type: 'Server', reason: 'Extended support ends 2026-10-14', age: 6.2 },
              { asset: 'HV-SW-004', type: 'Switch', reason: 'End of vendor support', age: 7.8 },
              { asset: 'HV-WKS-052', type: 'Workstation', reason: 'Unsupported OS build', age: 4.7 },
              { asset: 'HV-WKS-058', type: 'Workstation', reason: 'Warranty expired 2026-01-24', age: 5.1 },
              { asset: 'HV-NB-019', type: 'Laptop', reason: 'Warranty expired 2026-04-06', age: 4.9 },
              { asset: 'HV-NB-024', type: 'Laptop', reason: 'Unsupported OS build', age: 4.3 },
              { asset: 'HV-SRV-005', type: 'Server', reason: 'Warranty expired 2026-05-18', age: 6.8 },
              { asset: 'HV-SW-009', type: 'Switch', reason: 'End of vendor support', age: 8.1 },
            ],
          },
          provenance: {
            sourceSystem: 'RMM — asset inventory',
            sourceQuery: "warranty_end < today OR os_support = 'unsupported'",
            approvedBy: 'Priya Raman (vCIO)',
            approvedAt: '2026-07-01T16:52:00Z',
          },
        },
      },
      {
        id: 'tickets-by-month',
        kind: 'bar-chart',
        label: 'Ticket volume by month',
        caption: 'Closed tickets per month, Q2 2026',
        series: [
          { label: 'April', value: 121 },
          { label: 'May', value: 148 },
          { label: 'June', value: 143 },
        ],
        evidence: {
          title: 'Ticket volume by month',
          summary: 'Monthly totals with the split by request type behind each bar.',
          table: {
            columns: [
              { key: 'month', label: 'Month' },
              { key: 'incidents', label: 'Incidents', align: 'right' },
              { key: 'requests', label: 'Requests', align: 'right' },
              { key: 'projects', label: 'Project tasks', align: 'right' },
              { key: 'total', label: 'Total', align: 'right' },
            ],
            rows: [
              { month: 'April 2026', incidents: 54, requests: 51, projects: 16, total: 121 },
              { month: 'May 2026', incidents: 71, requests: 58, projects: 19, total: 148 },
              { month: 'June 2026', incidents: 63, requests: 62, projects: 18, total: 143 },
            ],
          },
          provenance: {
            sourceSystem: 'PSA — ticket export',
            sourceQuery: 'GROUP BY month(closed_at), request_type WHERE period = 2026-Q2',
            approvedBy: 'Priya Raman (vCIO)',
            approvedAt: '2026-07-01T16:58:00Z',
          },
        },
      },
      {
        id: 'patch-compliance',
        kind: 'claim',
        label: 'Patch compliance held above 98% every week this quarter',
        caption:
          'Measured across 96 managed endpoints, weekly. Lowest week was 98.2% in the week of 18 May.',
        evidence: {
          title: 'Weekly patch compliance',
          summary: 'Compliance percentage for each of the 13 weeks. Six lowest weeks shown.',
          table: {
            columns: [
              { key: 'week', label: 'Week commencing' },
              { key: 'endpoints', label: 'Endpoints', align: 'right' },
              { key: 'compliant', label: 'Compliant', align: 'right' },
              { key: 'pct', label: 'Compliance', align: 'right' },
            ],
            rows: [
              { week: '2026-05-18', endpoints: 96, compliant: 94, pct: '98.2%' },
              { week: '2026-04-13', endpoints: 95, compliant: 93, pct: '98.4%' },
              { week: '2026-06-15', endpoints: 96, compliant: 95, pct: '98.9%' },
              { week: '2026-04-27', endpoints: 95, compliant: 94, pct: '98.9%' },
              { week: '2026-06-01', endpoints: 96, compliant: 95, pct: '99.0%' },
              { week: '2026-05-04', endpoints: 96, compliant: 95, pct: '99.0%' },
            ],
          },
          provenance: {
            sourceSystem: 'RMM — patch policy report',
            sourceQuery: "weekly rollup, policy = 'Harbourview standard'",
            approvedBy: 'Priya Raman (vCIO)',
            approvedAt: '2026-07-01T17:03:00Z',
          },
        },
      },
      {
        id: 'backup-verification',
        kind: 'claim',
        label: 'Every nightly backup was verified by restore test',
        caption:
          '91 nightly jobs, 91 verified restores. Two jobs required a re-run before passing.',
        evidence: {
          title: 'Backup verification log',
          summary:
            'Nightly job outcomes. The two jobs that needed a re-run are listed first.',
          table: {
            columns: [
              { key: 'date', label: 'Date' },
              { key: 'job', label: 'Job' },
              { key: 'result', label: 'Restore test' },
              { key: 'attempts', label: 'Attempts', align: 'right' },
            ],
            rows: [
              { date: '2026-05-09', job: 'HV-SRV-001 full', result: 'Passed on re-run', attempts: 2 },
              { date: '2026-06-22', job: 'HV-SRV-002 full', result: 'Passed on re-run', attempts: 2 },
              { date: '2026-06-29', job: 'HV-SRV-001 full', result: 'Passed', attempts: 1 },
              { date: '2026-06-30', job: 'HV-SRV-002 full', result: 'Passed', attempts: 1 },
            ],
          },
          provenance: {
            sourceSystem: 'Backup platform — verification log',
            sourceQuery: 'job_type = nightly AND period = 2026-Q2',
            approvedBy: 'Priya Raman (vCIO)',
            approvedAt: '2026-07-01T17:07:00Z',
          },
        },
      },
    ],
  };

  return JSON.stringify(manifest, null, 2);
};

const main = (): void => {
  const output = generator();
  for (const path of OUT) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${output}\n`, 'utf8');
  }
  // Validate what we wrote.
  for (const path of OUT) {
    JSON.parse(output);
    console.log(`wrote ${path} (${output.length} bytes)`);
  }
};

main();