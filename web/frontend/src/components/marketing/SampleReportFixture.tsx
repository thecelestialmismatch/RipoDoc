'use client';

import demoManifest from '../../../content/reports/rpt-demo-0001.json';
import { SampleReport } from './SampleReport.tsx';
import type { ReportManifest } from '@/lib/evidence/types.ts';

const manifest = demoManifest as ReportManifest;

export function SampleReportFixture() {
  return <SampleReport manifest={manifest} />;
}
